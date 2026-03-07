const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { uploadMedia } = require('../config/cloudinary');
const ctrl = require('../controllers/songController');

// Público
router.get('/all', ctrl.getAll);
router.get('/category/:categoryId', ctrl.getByCategory);
router.get('/:id', ctrl.getOne);

// Admin — usa uploadMedia para aceitar áudio E vídeo no mesmo campo "media"
router.use(protect, restrictTo('admin'));
router.post('/',    uploadMedia.single('media'), ctrl.create);
router.put('/:id',  uploadMedia.single('media'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
