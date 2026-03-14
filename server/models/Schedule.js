const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  soldier:  { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
  timeSlot: { type: String, default: '00h–24h' },
  notes:    { type: String, default: '' },
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  date:      { type: Date, required: true, unique: true },
  entries:   [entrySchema],
  title:     { type: String, default: '' },
  notes:     { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
