const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { uploadAudio } = require('../config/cloudinary');
const ctrl = require('../controllers/songController');

router.get('/all', ctrl.getAll);
router.get('/category/:categoryId', ctrl.getByCategory);
router.get('/:id', ctrl.getOne);

router.use(protect, restrictTo('admin'));

router.post('/', uploadAudio.single('audio'), ctrl.create);
router.put('/:id', uploadAudio.single('audio'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
