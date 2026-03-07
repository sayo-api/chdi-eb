const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Acesso negado. Faça login.' });

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) return res.status(401).json({ message: 'Usuário não encontrado.' });

    if (user.changedPasswordAfter(decoded.iat))
      return res.status(401).json({ message: 'Senha foi alterada. Faça login novamente.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Token expirado.', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Acesso negado. Sem permissão.' });
  next();
};
