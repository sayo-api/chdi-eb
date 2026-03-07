const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/syncController');

// Público — o app usa para verificar a versão sem autenticação
router.get('/status', ctrl.getStatus);

// Admin only — publica nova versão de conteúdo
router.post('/publish', protect, restrictTo('admin'), ctrl.publish);

module.exports = router;
