const { verifyAccessToken } = require('../utils/jwt');
const AppUser = require('../models/AppUser');

exports.protectAppUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Login necessário no aplicativo.' });
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (decoded.role !== 'appuser')
      return res.status(403).json({ message: 'Acesso negado.' });
    const user = await AppUser.findById(decoded.id).select('-password');
    if (!user || !user.active)
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
    req.appUser = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

exports.optionalAppUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (decoded.role === 'appuser') {
      const user = await AppUser.findById(decoded.id).select('-password');
      if (user && user.active) req.appUser = user;
    }
    next();
  } catch { next(); }
};
