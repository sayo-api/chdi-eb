const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório'],
    trim: true,
    maxlength: [80, 'Nome muito longo'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Descrição muito longa'],
  },
  icon: {
    type: String,
    default: 'music-note',
  },
  iconColor: {
    type: String,
    default: 'green',
    enum: ['green', 'gold', 'olive', 'dark-green', 'red', 'blue'],
  },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  songCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
