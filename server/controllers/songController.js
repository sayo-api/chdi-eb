const Song     = require('../models/Song');
const Category = require('../models/Category');
const { cloudinary, uploadBuffer } = require('../config/cloudinary');

// ─── Público ──────────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const songs = await Song.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .populate('category', 'name icon iconColor sectionLabel')
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
      .populate('category', 'name icon iconColor sectionLabel');
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
    const { title, description, categoryId, contentType, lyrics, cards, videos, cardsLabel, order } = req.body;

    if (!title)      return res.status(422).json({ message: 'Título é obrigatório.' });
    if (!categoryId) return res.status(422).json({ message: 'Categoria é obrigatória.' });

    const type = contentType === 'video' ? 'video' : 'audio';

    // Para vídeo: pode ter req.file (1 vídeo principal) OU videos[] (múltiplos via JSON)
    const hasMultiVideos = videos && JSON.parse(videos || '[]').length > 0;
    if (type !== 'video' && !req.file) {
      return res.status(400).json({ message: 'Arquivo de áudio é obrigatório.' });
    }
    if (type === 'video' && !req.file && !hasMultiVideos) {
      return res.status(400).json({ message: 'Envie ao menos um vídeo.' });
    }

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });

    let parsedLyrics = [], parsedCards = [], parsedVideos = [];
    try { if (lyrics) parsedLyrics = JSON.parse(lyrics); } catch (_) {}
    try { if (cards)  parsedCards  = JSON.parse(cards);  } catch (_) {}
    try { if (videos) parsedVideos = JSON.parse(videos); } catch (_) {}

    const songData = {
      title: title.trim(),
      description: description?.trim(),
      category: categoryId,
      contentType: type,
      cardsLabel: cardsLabel?.trim() || 'INSTRUÇÕES DE EXECUÇÃO',
      coverUrl: req.body.coverUrl || null,
      lyrics: parsedLyrics,
      cards: parsedCards,
      videos: parsedVideos,
      order: order ? parseInt(order) : 0,
      createdBy: req.user._id,
    };

    // Upload do vídeo principal (se enviado como arquivo)
    if (req.file) {
      const folder   = `chdi/${type === 'video' ? 'videos' : 'songs'}/${categoryId}`;
      const publicId = `${Date.now()}_${req.file.originalname.replace(/\s+/g,'_').split('.')[0]}`;
      const result   = await uploadBuffer(req.file.buffer, { folder, resource_type: 'video', public_id: publicId });
      if (type === 'video') {
        songData.videoUrl      = result.secure_url;
        songData.videoPublicId = result.public_id;
      } else {
        songData.audioUrl      = result.secure_url;
        songData.audioPublicId = result.public_id;
      }
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
    const { title, description, categoryId, contentType, lyrics, cards, videos, cardsLabel, order, active } = req.body;
    const updateData = {};

    if (title       !== undefined) updateData.title       = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (categoryId  !== undefined) updateData.category    = categoryId;
    if (order       !== undefined) updateData.order       = parseInt(order);
    if (active      !== undefined) updateData.active      = active === 'true' || active === true;
    if (cardsLabel  !== undefined) updateData.cardsLabel  = cardsLabel?.trim() || 'INSTRUÇÕES DE EXECUÇÃO';

    try { if (lyrics !== undefined) updateData.lyrics = JSON.parse(lyrics); } catch (_) {}
    try { if (cards  !== undefined) updateData.cards  = JSON.parse(cards);  } catch (_) {}
    try { if (videos !== undefined) updateData.videos = JSON.parse(videos); } catch (_) {}

    if (req.file) {
      const existing = await Song.findById(req.params.id);
      const type = existing?.contentType || 'audio';
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
      } else {
        updateData.audioUrl      = result.secure_url;
        updateData.audioPublicId = result.public_id;
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
    if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'video' }).catch(() => {});
    if (song.coverPublicId) await cloudinary.uploader.destroy(song.coverPublicId, { resource_type: 'image' }).catch(() => {});
    await song.deleteOne();
    res.json({ message: 'Conteúdo removido.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover.' });
  }
};
