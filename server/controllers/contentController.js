const Content = require('../models/Content');

exports.getContent = async (req, res) => {
  try {
    const query = { active: true };
    if (!req.appUser) {
      query.visibility = 'all';
    } else {
      query.$or = [
        { visibility: 'all' },
        { visibility: 'loggedIn' },
        { visibility: 'specific', targetUsers: req.appUser._id },
      ];
    }
    const content = await Content.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ content });
  } catch { res.status(500).json({ message: 'Erro ao buscar conteúdo.' }); }
};

exports.adminList = async (req, res) => {
  try {
    const content = await Content.find().populate('targetUsers','name soldierNumber').sort({ createdAt: -1 });
    res.json({ content });
  } catch { res.status(500).json({ message: 'Erro ao buscar conteúdo.' }); }
};

exports.create = async (req, res) => {
  try {
    const { title, body, type, visibility, targetUsers } = req.body;
    if (!title || !body) return res.status(422).json({ message: 'Título e corpo são obrigatórios.' });
    const item = await Content.create({ title, body, type, visibility, targetUsers: targetUsers || [], createdBy: req.user._id });
    res.status(201).json({ message: 'Conteúdo criado.', item });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro ao criar conteúdo.' }); }
};

exports.update = async (req, res) => {
  try {
    const item = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Conteúdo não encontrado.' });
    res.json({ message: 'Conteúdo atualizado.', item });
  } catch { res.status(500).json({ message: 'Erro ao atualizar conteúdo.' }); }
};

exports.remove = async (req, res) => {
  try {
    const item = await Content.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Conteúdo não encontrado.' });
    res.json({ message: 'Conteúdo removido.' });
  } catch { res.status(500).json({ message: 'Erro ao remover conteúdo.' }); }
};
