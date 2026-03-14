const express = require('express');
const router  = express.Router();
const WebPushSubscription = require('../models/WebPushSubscription');
const FcmToken            = require('../models/FcmToken');
const { protectAppUser }  = require('../middleware/appAuth');

// VAPID public key
router.get('/vapid-public-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ message: 'Push não configurado.' });
  res.json({ publicKey: key });
});

// Web Push subscribe
router.post('/web-subscribe', protectAppUser, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth)
      return res.status(422).json({ message: 'Dados de subscription inválidos.' });
    await WebPushSubscription.findOneAndUpdate(
      { endpoint },
      { user: req.appUser._id, endpoint, keys, userAgent: req.headers['user-agent'], active: true },
      { upsert: true, new: true }
    );
    res.json({ message: 'Subscription salva.' });
  } catch (err) { console.error('[Push] web-subscribe error:', err); res.status(500).json({ message: 'Erro ao salvar subscription.' }); }
});

// Web Push unsubscribe
router.delete('/web-unsubscribe', protectAppUser, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) await WebPushSubscription.findOneAndUpdate({ endpoint }, { active: false });
    res.json({ message: 'Subscription removida.' });
  } catch { res.status(500).json({ message: 'Erro ao remover subscription.' }); }
});

// FCM token register
router.post('/fcm-token', protectAppUser, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(422).json({ message: 'Token FCM obrigatório.' });
    await FcmToken.findOneAndUpdate(
      { token },
      { user: req.appUser._id, token, platform: 'android', active: true },
      { upsert: true, new: true }
    );
    res.json({ message: 'Token FCM registrado.' });
  } catch (err) { console.error('[Push] fcm-token error:', err); res.status(500).json({ message: 'Erro ao registrar token FCM.' }); }
});

// FCM token unregister
router.delete('/fcm-token', protectAppUser, async (req, res) => {
  try {
    const { token } = req.body;
    if (token) await FcmToken.findOneAndUpdate({ token }, { active: false });
    res.json({ message: 'Token FCM removido.' });
  } catch { res.status(500).json({ message: 'Erro.' }); }
});

module.exports = router;
