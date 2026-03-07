const Song = require('../models/Song');
const Category = require('../models/Category');
const { cloudinary, uploadBuffer } = require('../config/cloudinary');

exports.getByCategory = async (req, res) => {
  try {
    const songs = await Song.find({ category: req.params.categoryId, active: true })
      .sort({ order: 1, createdAt: 1 })
      .select('-audioPublicId -coverPublicId');
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar músicas.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('category', 'name icon iconColor');
    if (!song || !song.active) return res.status(404).json({ message: 'Música não encontrada.' });
    await Song.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } });
    res.json({ song });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar música.' });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Arquivo de áudio é obrigatório.' });

    const { title, description, categoryId, lyrics, order } = req.body;
    if (!title) return res.status(422).json({ message: 'Título é obrigatório.' });
    if (!categoryId) return res.status(422).json({ message: 'Categoria é obrigatória.' });

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });

    // Upload buffer → Cloudinary
    const publicId = `${Date.now()}_${req.file.originalname.replace(/\s+/g,'_').split('.')[0]}`;
    const result = await uploadBuffer(req.file.buffer, {
      folder: `chdi/songs/${categoryId}`,
      resource_type: 'video', // Cloudinary usa "video" para áudio
      public_id: publicId,
    });

    let parsedLyrics = [];
    if (lyrics) { try { parsedLyrics = JSON.parse(lyrics); } catch (_) {} }

    const song = await Song.create({
      title: title.trim(),
      description: description?.trim(),
      category: categoryId,
      audioUrl: result.secure_url,
      audioPublicId: result.public_id,
      lyrics: parsedLyrics,
      order: order ? parseInt(order) : 0,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Música adicionada com sucesso.', song });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar música.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, categoryId, lyrics, order, active } = req.body;
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (categoryId) updateData.category = categoryId;
    if (lyrics !== undefined) { try { updateData.lyrics = JSON.parse(lyrics); } catch (_) {} }
    if (order !== undefined) updateData.order = parseInt(order);
    if (active !== undefined) updateData.active = active === 'true' || active === true;

    if (req.file) {
      // Deletar áudio antigo do Cloudinary
      const old = await Song.findById(req.params.id);
      if (old?.audioPublicId) {
        await cloudinary.uploader.destroy(old.audioPublicId, { resource_type: 'video' }).catch(() => {});
      }
      // Upload novo
      const publicId = `${Date.now()}_${req.file.originalname.replace(/\s+/g,'_').split('.')[0]}`;
      const result = await uploadBuffer(req.file.buffer, {
        folder: `chdi/songs/${categoryId || old?.category}`,
        resource_type: 'video',
        public_id: publicId,
      });
      updateData.audioUrl = result.secure_url;
      updateData.audioPublicId = result.public_id;
    }

    const song = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!song) return res.status(404).json({ message: 'Música não encontrada.' });
    res.json({ message: 'Música atualizada.', song });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar música.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Música não encontrada.' });
    if (song.audioPublicId) {
      await cloudinary.uploader.destroy(song.audioPublicId, { resource_type: 'video' }).catch(() => {});
    }
    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Música removida.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover música.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const songs = await Song.find({ active: true }).populate('category', 'name').sort({ createdAt: -1 });
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar músicas.' });
  }
};
