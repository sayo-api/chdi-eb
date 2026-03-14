const AppUser = require('../models/AppUser');
const { signAccessToken } = require('../utils/jwt');

exports.listUsers = async (req, res) => {
  try {
    const users = await AppUser.find({ active: true }).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch { res.status(500).json({ message: 'Erro ao buscar usuários.' }); }
};

exports.addUser = async (req, res) => {
  try {
    const { name, soldierNumber, rank } = req.body;
    if (!name || !soldierNumber)
      return res.status(422).json({ message: 'Nome e número do soldado são obrigatórios.' });
    const existing = await AppUser.findOne({ soldierNumber: soldierNumber.trim() });
    if (existing) return res.status(409).json({ message: 'Número de soldado já cadastrado.' });
    const user = await AppUser.create({ name: name.trim(), soldierNumber: soldierNumber.trim(), rank: rank || 'Soldado', addedBy: req.user._id });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso.', user: { _id: user._id, name: user.name, soldierNumber: user.soldierNumber, rank: user.rank, hasSetPassword: false } });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro ao cadastrar usuário.' }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, rank } = req.body;
    const user = await AppUser.findByIdAndUpdate(req.params.id, { ...(name && { name: name.trim() }), ...(rank && { rank }) }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário atualizado.', user });
  } catch { res.status(500).json({ message: 'Erro ao atualizar usuário.' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await AppUser.findByIdAndUpdate(req.params.id, { active: false });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch { res.status(500).json({ message: 'Erro ao remover usuário.' }); }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const user = await AppUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    user.password = null; user.hasSetPassword = false;
    await user.save();
    res.json({ message: 'Senha resetada com sucesso.' });
  } catch { res.status(500).json({ message: 'Erro ao resetar senha.' }); }
};

exports.checkSoldier = async (req, res) => {
  try {
    const { soldierNumber } = req.body;
    if (!soldierNumber) return res.status(422).json({ message: 'Número do soldado é obrigatório.' });
    const user = await AppUser.findOne({ soldierNumber: soldierNumber.trim(), active: true });
    if (!user) return res.status(404).json({ message: 'Número de soldado não encontrado.' });
    res.json({ found: true, hasSetPassword: user.hasSetPassword, name: user.name, rank: user.rank });
  } catch { res.status(500).json({ message: 'Erro ao verificar soldado.' }); }
};

exports.setPassword = async (req, res) => {
  try {
    const { soldierNumber, password } = req.body;
    if (!soldierNumber || !password) return res.status(422).json({ message: 'Número e senha são obrigatórios.' });
    if (password.length < 4) return res.status(422).json({ message: 'Senha deve ter pelo menos 4 caracteres.' });
    const user = await AppUser.findOne({ soldierNumber: soldierNumber.trim(), active: true }).select('+password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    if (user.hasSetPassword) return res.status(400).json({ message: 'Senha já definida. Use o login normal.' });
    user.password = password; user.hasSetPassword = true;
    await user.save();
    const token = signAccessToken(user._id, 'appuser');
    res.json({ message: 'Senha definida com sucesso.', accessToken: token, user: { id: user._id, name: user.name, soldierNumber: user.soldierNumber, rank: user.rank, role: 'appuser' } });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro ao definir senha.' }); }
};

exports.loginSoldier = async (req, res) => {
  try {
    const { soldierNumber, password } = req.body;
    if (!soldierNumber || !password) return res.status(422).json({ message: 'Número e senha são obrigatórios.' });
    const user = await AppUser.findOne({ soldierNumber: soldierNumber.trim(), active: true }).select('+password');
    if (!user) return res.status(401).json({ message: 'Número de soldado ou senha incorretos.' });
    if (!user.hasSetPassword) return res.status(400).json({ message: 'Senha não definida. Faça o primeiro acesso.', needsSetup: true });
    const correct = await user.correctPassword(password);
    if (!correct) return res.status(401).json({ message: 'Número de soldado ou senha incorretos.' });
    const token = signAccessToken(user._id, 'appuser');
    res.json({ message: 'Login realizado.', accessToken: token, user: { id: user._id, name: user.name, soldierNumber: user.soldierNumber, rank: user.rank, role: 'appuser' } });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro ao fazer login.' }); }
};
