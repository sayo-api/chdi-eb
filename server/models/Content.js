const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 120 },
  body:        { type: String, required: true, maxlength: 2000 },
  type:        { type: String, enum: ['announcement','info','warning','success'], default: 'announcement' },
  visibility:  { type: String, enum: ['all','loggedIn','specific'], default: 'all' },
  targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' }],
  active:      { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
