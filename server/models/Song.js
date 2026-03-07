const mongoose = require('mongoose');

const lyricLineSchema = new mongoose.Schema({
  text:   { type: String, required: true },
  timeMs: { type: Number, required: true },
}, { _id: false });

const cardSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  steps: [{ type: String }],
}, { _id: false });

// Sub-doc para cada vídeo dentro do array videos[]
const videoItemSchema = new mongoose.Schema({
  label:          { type: String, default: '' },   // ex: "Parte 1 — Posição Inicial"
  videoUrl:       { type: String, default: null },
  videoPublicId:  { type: String },
  cards:          [cardSchema],                    // cards específicos deste vídeo
}, { _id: false });

const songSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Título é obrigatório'], trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500 },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  contentType: { type: String, enum: ['audio', 'video'], default: 'audio' },

  // Áudio
  audioUrl:       { type: String, default: null },
  audioPublicId:  { type: String },

  // Vídeo principal (legado / 1 vídeo)
  videoUrl:       { type: String, default: null },
  videoPublicId:  { type: String },

  // NOVO: múltiplos vídeos
  videos:         [videoItemSchema],

  // Nome da seção de cards (editável, default "INSTRUÇÕES DE EXECUÇÃO")
  cardsLabel:     { type: String, default: 'INSTRUÇÕES DE EXECUÇÃO', maxlength: 80 },

  coverUrl:       { type: String },
  coverPublicId:  { type: String },

  duration: { type: Number, default: 0 },

  lyrics: [lyricLineSchema],
  cards:  [cardSchema],   // cards globais (quando há 1 vídeo)

  active:    { type: Boolean, default: true },
  order:     { type: Number,  default: 0 },
  playCount: { type: Number,  default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);
