const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true, index: true },
  type:        { type: String, enum: ['schedule_added','schedule_changed','schedule_removed','content','info'], default: 'info' },
  title:       { type: String, required: true, maxlength: 120 },
  message:     { type: String, required: true, maxlength: 500 },
  read:        { type: Boolean, default: false },
  relatedDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
