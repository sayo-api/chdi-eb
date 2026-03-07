const Category = require('../models/Category');
const Song = require('../models/Song');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ order: 1, createdAt: 1 });
    // Update song counts
    const withCounts = await Promise.all(categories.map(async (cat) => {
      const count = await Song.countDocuments({ category: cat._id, active: true });
      return { ...cat.toObject(), songCount: count };
    }));
    res.json({ categories: withCounts });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar categorias.' });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try {
    const { name, description, sectionLabel, icon, iconColor, order } = req.body;
    const category = await Category.create({ name, description, sectionLabel, icon, iconColor, order });
    res.status(201).json({ message: 'Categoria criada.', category });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });
    res.json({ message: 'Categoria atualizada.', category });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar categoria.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const songs = await Song.countDocuments({ category: req.params.id });
    if (songs > 0) return res.status(400).json({ message: `Não é possível remover: ${songs} canção(ões) nesta categoria.` });
    await Category.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Categoria removida.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover categoria.' });
  }
};
