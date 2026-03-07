const Pdf      = require('../models/Pdf');
const Category = require('../models/Category');
const { cloudinary, uploadBuffer } = require('../config/cloudinary');

// ─── Público ──────────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const pdfs = await Pdf.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .populate('category', 'name icon iconColor sectionLabel')
      .select('-pdfPublicId -coverPublicId');
    res.json({ pdfs });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar PDFs.' });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const pdfs = await Pdf.find({ category: req.params.categoryId, active: true })
      .sort({ order: 1, createdAt: 1 })
      .select('-pdfPublicId -coverPublicId');
    res.json({ pdfs });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar PDFs.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id)
      .populate('category', 'name icon iconColor sectionLabel');
    if (!pdf || !pdf.active) return res.status(404).json({ message: 'PDF não encontrado.' });
    res.json({ pdf });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar PDF.' });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.create = async (req, res) => {
  try {
    const { title, subtitle, description, categoryId, cardsLabel, cards, pageCount, order } = req.body;

    if (!title)      return res.status(422).json({ message: 'Título é obrigatório.' });
    if (!categoryId) return res.status(422).json({ message: 'Categoria é obrigatória.' });
    if (!req.files?.pdf?.[0]) return res.status(400).json({ message: 'Arquivo PDF é obrigatório.' });

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });

    let parsedCards = [];
    try { if (cards) parsedCards = JSON.parse(cards); } catch (_) {}

    // Upload PDF (raw)
    const pdfFile = req.files.pdf[0];
    const pdfResult = await uploadBuffer(pdfFile.buffer, {
      resource_type: 'raw',
      folder: 'chdi-pdfs',
      use_filename: true,
      unique_filename: true,
    });

    // Upload capa (image) — opcional
    let coverUrl = null, coverPublicId = null;
    if (req.files?.cover?.[0]) {
      const coverResult = await uploadBuffer(req.files.cover[0].buffer, {
        resource_type: 'image',
        folder: 'chdi-covers',
        transformation: [{ width: 600, height: 800, crop: 'fill', quality: 'auto' }],
      });
      coverUrl      = coverResult.secure_url;
      coverPublicId = coverResult.public_id;
    }

    const pdf = await Pdf.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      description: description?.trim() || '',
      category: categoryId,
      pdfUrl: pdfResult.secure_url,
      pdfPublicId: pdfResult.public_id,
      fileSize: pdfFile.size,
      pageCount: parseInt(pageCount) || 0,
      coverUrl,
      coverPublicId,
      cardsLabel: cardsLabel?.trim() || 'NOTAS DE INSTRUÇÃO',
      cards: parsedCards,
      order: parseInt(order) || 0,
    });

    res.status(201).json({ message: 'PDF criado.', pdf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar PDF.' });
  }
};

exports.update = async (req, res) => {
  try {
    const existing = await Pdf.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'PDF não encontrado.' });

    const { title, subtitle, description, categoryId, cardsLabel, cards, pageCount, order } = req.body;

    let parsedCards = existing.cards;
    try { if (cards) parsedCards = JSON.parse(cards); } catch (_) {}

    const updateData = {
      title:      title?.trim()       || existing.title,
      subtitle:   subtitle?.trim()    ?? existing.subtitle,
      description:description?.trim() ?? existing.description,
      category:   categoryId          || existing.category,
      cardsLabel: cardsLabel?.trim()  || existing.cardsLabel,
      cards:      parsedCards,
      pageCount:  parseInt(pageCount) || existing.pageCount,
      order:      parseInt(order)     ?? existing.order,
    };

    // Novo PDF enviado?
    if (req.files?.pdf?.[0]) {
      // Apaga antigo no Cloudinary
      if (existing.pdfPublicId) {
        try { await cloudinary.uploader.destroy(existing.pdfPublicId, { resource_type: 'raw' }); } catch (_) {}
      }
      const pdfResult = await uploadBuffer(req.files.pdf[0].buffer, {
        resource_type: 'raw', folder: 'chdi-pdfs', use_filename: true, unique_filename: true,
      });
      updateData.pdfUrl      = pdfResult.secure_url;
      updateData.pdfPublicId = pdfResult.public_id;
      updateData.fileSize    = req.files.pdf[0].size;
    }

    // Nova capa?
    if (req.files?.cover?.[0]) {
      if (existing.coverPublicId) {
        try { await cloudinary.uploader.destroy(existing.coverPublicId); } catch (_) {}
      }
      const coverResult = await uploadBuffer(req.files.cover[0].buffer, {
        resource_type: 'image', folder: 'chdi-covers',
        transformation: [{ width: 600, height: 800, crop: 'fill', quality: 'auto' }],
      });
      updateData.coverUrl      = coverResult.secure_url;
      updateData.coverPublicId = coverResult.public_id;
    }

    const pdf = await Pdf.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ message: 'PDF atualizado.', pdf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar PDF.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'PDF não encontrado.' });

    // Apaga assets do Cloudinary
    if (pdf.pdfPublicId) {
      try { await cloudinary.uploader.destroy(pdf.pdfPublicId, { resource_type: 'raw' }); } catch (_) {}
    }
    if (pdf.coverPublicId) {
      try { await cloudinary.uploader.destroy(pdf.coverPublicId); } catch (_) {}
    }

    await Pdf.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'PDF removido.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover PDF.' });
  }
};
