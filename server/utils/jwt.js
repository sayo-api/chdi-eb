const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const signAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

const signRefreshToken = (userId) => {
  const jti = uuidv4();
  const token = jwt.sign({ id: userId, jti }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
  return { token, jti };
};

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', cookieOptions);
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, setRefreshCookie, clearRefreshCookie };
