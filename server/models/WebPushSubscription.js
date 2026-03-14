const mongoose = require('mongoose');

const webPushSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
  endpoint:  { type: String, required: true, unique: true },
  keys:      { p256dh: String, auth: String },
  userAgent: { type: String },
  active:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('WebPushSubscription', webPushSchema);
