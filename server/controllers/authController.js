const User = require('../models/User');
const { validationResult } = require('express-validator');
const {
  signAccessToken, signRefreshToken, verifyRefreshToken,
  setRefreshCookie, clearRefreshCookie
} = require('../utils/jwt');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { name, email, password, adminSecret } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email já cadastrado.' });

    const role = adminSecret === process.env.ADMIN_SECRET ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });

    const accessToken = signAccessToken(user._id, user.role);
    const { token: refreshToken, jti } = signRefreshToken(user._id);

    user.refreshTokens = [jti];
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      message: 'Conta criada com sucesso.',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshTokens +loginAttempts +lockUntil');

    if (!user) return res.status(401).json({ message: 'Email ou senha incorretos.' });

    if (user.isLocked()) {
      const wait = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ message: `Conta bloqueada. Tente novamente em ${wait} minutos.` });
    }

    const correct = await user.correctPassword(password);
    if (!correct) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Email ou senha incorretos.' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;

    const accessToken = signAccessToken(user._id, user.role);
    const { token: refreshToken, jti } = signRefreshToken(user._id);

    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), jti];
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.json({
      message: 'Login realizado.',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token não encontrado.' });

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens?.includes(decoded.jti))
      return res.status(401).json({ message: 'Token inválido ou expirado.' });

    const accessToken = signAccessToken(user._id, user.role);
    const { token: newRefresh, jti } = signRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter(t => t !== decoded.jti).concat(jti);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefresh);
    res.json({ accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    res.status(401).json({ message: 'Token inválido.' });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter(t => t !== decoded.jti);
        await user.save({ validateBeforeSave: false });
      }
    } catch (_) {}
  }
  clearRefreshCookie(res);
  res.json({ message: 'Logout realizado.' });
};

exports.me = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
};
