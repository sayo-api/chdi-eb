const Song     = require('../models/Song');
const Category = require('../models/Category');
const { cloudinary, uploadBuffer } = require('../config/cloudinary');

// ─── Público ──────────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const songs = await Song.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .populate('category', 'name icon iconColor')
      .select('-audioPublicId -videoPublicId -coverPublicId');
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar músicas.' });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const songs = await Song.find({ category: req.params.categoryId, active: true })
      .sort({ order: 1, createdAt: 1 })
      .select('-audioPublicId -videoPublicId -coverPublicId');
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar músicas.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('category', 'name icon iconColor');
    if (!song || !song.active) return res.status(404).json({ message: 'Conteúdo não encontrado.' });
    await Song.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } });
    res.json({ song });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar conteúdo.' });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.create = async (req, res) => {
  try {
    const { title, description, categoryId, contentType, lyrics, cards, order } = req.body;

    if (!title)      return res.status(422).json({ message: 'Título é obrigatório.' });
    if (!categoryId) return res.status(422).json({ message: 'Categoria é obrigatória.' });

    const type = contentType === 'video' ? 'video' : 'audio';

    if (!req.file) return res.status(400).json({
      message: type === 'video'
        ? 'Arquivo de vídeo é obrigatório.'
        : 'Arquivo de áudio é obrigatório.',
    });

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });

    const publicId = `${Date.now()}_${req.file.originalname.replace(/\s+/g,'_').split('.')[0]}`;
    const resourceType = type === 'video' ? 'video' : 'video'; // Cloudinary usa "video" para ambos
    const folder = `chdi/${type === 'video' ? 'videos' : 'songs'}/${categoryId}`;

    const result = await uploadBuffer(req.file.buffer, {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      // Para vídeos grandes usa upload chunked implícito via stream
    });

    let parsedLyrics = [];
    let parsedCards  = [];
    try { if (lyrics) parsedLyrics = JSON.parse(lyrics); } catch (_) {}
    try { if (cards)  parsedCards  = JSON.parse(cards);  } catch (_) {}

    const songData = {
      title: title.trim(),
      description: description?.trim(),
      category: categoryId,
      contentType: type,
      coverUrl: req.body.coverUrl || null,
      lyrics: parsedLyrics,
      cards: parsedCards,
      order: order ? parseInt(order) : 0,
      createdBy: req.user._id,
    };

    if (type === 'video') {
      songData.videoUrl      = result.secure_url;
      songData.videoPublicId = result.public_id;
    } else {
      songData.audioUrl      = result.secure_url;
      songData.audioPublicId = result.public_id;
    }

    const song = await Song.create(songData);
    res.status(201).json({ message: 'Conteúdo adicionado com sucesso.', song });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar conteúdo.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, categoryId, contentType, lyrics, cards, order, active } = req.body;
    const updateData = {};

    if (title       !== undefined) updateData.title       = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (categoryId  !== undefined) updateData.category    = categoryId;
    if (order       !== undefined) updateData.order       = parseInt(order);
    if (active      !== undefined) updateData.active      = active === 'true' || active === true;

    try { if (lyrics !== undefined) updateData.lyrics = JSON.parse(lyrics); } catch (_) {}
    try { if (cards  !== undefined) updateData.cards  = JSON.parse(cards);  } catch (_) {}

    if (req.file) {
      const existing = await Song.findById(req.params.id);
      const type = contentType === 'video' ? 'video' : (existing?.contentType || 'audio');

      // Remove mídia antiga do Cloudinary
      const oldPublicId = type === 'video' ? existing?.videoPublicId : existing?.audioPublicId;
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'video' }).catch(() => {});
      }

      const publicId = `${Date.now()}_${req.file.originalname.replace(/\s+/g,'_').split('.')[0]}`;
      const folder   = `chdi/${type === 'video' ? 'videos' : 'songs'}/${categoryId || existing?.category}`;
      const result   = await uploadBuffer(req.file.buffer, { folder, resource_type: 'video', public_id: publicId });

      if (type === 'video') {
        updateData.videoUrl      = result.secure_url;
        updateData.videoPublicId = result.public_id;
        updateData.contentType   = 'video';
      } else {
        updateData.audioUrl      = result.secure_url;
        updateData.audioPublicId = result.public_id;
        updateData.contentType   = 'audio';
      }
    }

    const song = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!song) return res.status(404).json({ message: 'Conteúdo não encontrado.' });
    res.json({ message: 'Conteúdo atualizado.', song });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar conteúdo.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Conteúdo não encontrado.' });

    const publicId = song.audioPublicId || song.videoPublicId;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' }).catch(() => {});
    }
    if (song.coverPublicId) {
      await cloudinary.uploader.destroy(song.coverPublicId, { resource_type: 'image' }).catch(() => {});
    }

    await song.deleteOne();
    res.json({ message: 'Conteúdo removido.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover.' });
  }
};
