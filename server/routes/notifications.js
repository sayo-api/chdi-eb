const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notificationController');
const { protectAppUser } = require('../middleware/appAuth');

router.use(protectAppUser);
router.get('/',             ctrl.getMyNotifications);
router.put('/read-all',     ctrl.markAllRead);
router.put('/:id/read',     ctrl.markRead);

module.exports = router;
