const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.appUser._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.appUser._id, read: false });
    res.json({ notifications, unread });
  } catch { res.status(500).json({ message: 'Erro ao buscar notificações.' }); }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.appUser._id, read: false }, { read: true });
    res.json({ message: 'Notificações marcadas como lidas.' });
  } catch { res.status(500).json({ message: 'Erro ao marcar notificações.' }); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.appUser._id }, { read: true });
    res.json({ message: 'Notificação lida.' });
  } catch { res.status(500).json({ message: 'Erro.' }); }
};
