const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/scheduleController');
const { protect, restrictTo } = require('../middleware/auth');
const { protectAppUser } = require('../middleware/appAuth');

// App user routes
router.get('/mine',       protectAppUser, ctrl.mySchedule);
router.get('/all-active', protectAppUser, ctrl.allActive);

// Admin routes
router.use(protect, restrictTo('admin'));
router.get('/',          ctrl.listAll);
router.post('/',         ctrl.upsert);
router.delete('/:id',    ctrl.remove);

module.exports = router;
