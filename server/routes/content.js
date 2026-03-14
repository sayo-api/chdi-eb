const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/contentController');
const { protect, restrictTo } = require('../middleware/auth');
const { optionalAppUser } = require('../middleware/appAuth');

// Public/semi-public
router.get('/', optionalAppUser, ctrl.getContent);

// Admin routes
router.use(protect, restrictTo('admin'));
router.get('/admin/list', ctrl.adminList);
router.post('/',          ctrl.create);
router.put('/:id',        ctrl.update);
router.delete('/:id',     ctrl.remove);

module.exports = router;
