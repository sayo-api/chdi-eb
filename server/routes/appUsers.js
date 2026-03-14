const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/appUserController');
const { protect, restrictTo } = require('../middleware/auth');

// Public (app) routes
router.post('/check',        ctrl.checkSoldier);
router.post('/set-password', ctrl.setPassword);
router.post('/login',        ctrl.loginSoldier);

// Admin-only routes
router.use(protect, restrictTo('admin'));
router.get('/',                       ctrl.listUsers);
router.post('/',                      ctrl.addUser);
router.put('/:id',                    ctrl.updateUser);
router.delete('/:id',                 ctrl.deleteUser);
router.post('/:id/reset-password',    ctrl.resetUserPassword);

module.exports = router;
