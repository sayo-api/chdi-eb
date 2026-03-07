const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  steps: [{ type: String }],
}, { _id: false });

const pdfSchema = new mongoose.Schema({
  title:         { type: String, required: [true, 'Título é obrigatório'], trim: true, maxlength: 120 },
  subtitle:      { type: String, trim: true, maxlength: 200, default: '' },
  description:   { type: String, trim: true, maxlength: 500, default: '' },
  category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  // PDF principal
  pdfUrl:        { type: String, default: null },
  pdfPublicId:   { type: String },
  fileSize:      { type: Number, default: 0 },   // bytes
  pageCount:     { type: Number, default: 0 },

  // Capa (thumbnail)
  coverUrl:      { type: String, default: null },
  coverPublicId: { type: String },

  // Cards / notas de instrução
  cardsLabel:    { type: String, default: 'NOTAS DE INSTRUÇÃO', maxlength: 80 },
  cards:         [cardSchema],

  active:    { type: Boolean, default: true },
  order:     { type: Number,  default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Pdf', pdfSchema);
