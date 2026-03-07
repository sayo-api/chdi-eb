const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authCtrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Muitas tentativas. Tente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Muitos registros. Tente em 1 hora.' },
});

router.post('/register', registerLimiter, [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Nome: 2–60 caracteres.'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Senha: mínimo 8 caracteres.')
    .matches(/[A-Z]/).withMessage('Senha deve ter pelo menos uma letra maiúscula.')
    .matches(/[0-9]/).withMessage('Senha deve ter pelo menos um número.'),
], authCtrl.register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
  body('password').notEmpty().withMessage('Senha obrigatória.'),
], authCtrl.login);

router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);
router.get('/me', protect, authCtrl.me);

module.exports = router;
