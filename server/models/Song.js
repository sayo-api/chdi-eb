const mongoose = require('mongoose');

const lyricLineSchema = new mongoose.Schema({
  text:   { type: String, required: true },
  timeMs: { type: Number, required: true },
}, { _id: false });

// Card de texto para módulos de vídeo (estilo Ordem Unida / Continência)
const cardSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  steps: [{ type: String }],
}, { _id: false });

const songSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Título é obrigatório'], trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500 },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  // Tipo de conteúdo: 'audio' | 'video'
  contentType: { type: String, enum: ['audio', 'video'], default: 'audio' },

  // Áudio (para contentType === 'audio')
  audioUrl:       { type: String, default: null },
  audioPublicId:  { type: String },

  // Vídeo (para contentType === 'video')
  videoUrl:       { type: String, default: null },
  videoPublicId:  { type: String },

  // Capa
  coverUrl:       { type: String },
  coverPublicId:  { type: String },

  duration: { type: Number, default: 0 },

  // Letras sincronizadas (para áudio)
  lyrics: [lyricLineSchema],

  // Cards de texto (para vídeo — título + lista de passos de execução)
  cards: [cardSchema],

  active:    { type: Boolean, default: true },
  order:     { type: Number,  default: 0 },
  playCount: { type: Number,  default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);
