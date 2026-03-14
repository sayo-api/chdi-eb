const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const RANKS = [
  'Recruta','Soldado','Cabo',
  '3º Sargento','2º Sargento','1º Sargento','Subtenente',
  'Aspirante','2º Tenente','1º Tenente',
  'Capitão','Major','Tenente-Coronel','Coronel',
  'General de Brigada','General de Divisão','General de Exército','Marechal',
  'Comandante',
];

const appUserSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true, maxlength: 80 },
  soldierNumber:  { type: String, required: true, unique: true, trim: true, maxlength: 20 },
  rank:           { type: String, enum: RANKS, default: 'Soldado' },
  password:       { type: String, select: false, default: null },
  hasSetPassword: { type: Boolean, default: false },
  addedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active:         { type: Boolean, default: true },
}, { timestamps: true });

appUserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

appUserSchema.methods.correctPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('AppUser', appUserSchema);
module.exports.RANKS = RANKS;
