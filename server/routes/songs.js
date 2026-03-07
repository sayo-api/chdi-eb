const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { uploadMedia, uploadBuffer, cloudinary } = require('../config/cloudinary');
const ctrl = require('../controllers/songController');

// Público
router.get('/all', ctrl.getAll);
router.get('/category/:categoryId', ctrl.getByCategory);
router.get('/:id', ctrl.getOne);

// Admin
router.use(protect, restrictTo('admin'));

// Rota de upload temporário — usada pelo MultiVideoEditor para fazer upload de cada vídeo extra
// Retorna apenas a URL do vídeo no Cloudinary, sem criar um Song.
router.post('/upload-temp', uploadMedia.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    const { categoryId } = req.body;
    const folder   = `chdi/videos/${categoryId || 'temp'}`;
    const publicId = `${Date.now()}_${req.file.originalname.replace(/\s+/g,'_').split('.')[0]}`;
    const result   = await uploadBuffer(req.file.buffer, { folder, resource_type: 'video', public_id: publicId });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no upload temporário.' });
  }
});

router.post('/',      uploadMedia.single('media'), ctrl.create);
router.put('/:id',    uploadMedia.single('media'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
