const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/pdfController');

// Multer — aceita campos "pdf" (obrigatório) e "cover" (opcional)
const uploadPdfFields = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname)) cb(null, true);
      else cb(new Error('Apenas arquivos PDF'));
    } else if (file.fieldname === 'cover') {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Apenas imagens para capa'));
    } else {
      cb(null, false);
    }
  },
}).fields([
  { name: 'pdf',   maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

// ── Públicas ──────────────────────────────────────────────────────────────────
router.get('/',                      ctrl.getAll);
router.get('/category/:categoryId',  ctrl.getByCategory);
router.get('/:id',                   ctrl.getOne);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.use(protect, restrictTo('admin'));

router.post('/',     uploadPdfFields, ctrl.create);
router.put('/:id',   uploadPdfFields, ctrl.update);
router.delete('/:id',                ctrl.remove);

module.exports = router;
