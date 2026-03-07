const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `chdi/songs/${req.body.categoryId || 'uncategorized'}`,
    resource_type: 'video', // Cloudinary usa "video" para áudio
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'],
    public_id: `${Date.now()}_${file.originalname.replace(/\s+/g, '_').split('.')[0]}`,
  }),
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chdi/covers',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/mp3', 'audio/x-m4a'];
    if (allowed.includes(file.mimetype) || /\.(mp3|wav|ogg|m4a)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de áudio são permitidos (mp3, wav, ogg, m4a)'));
    }
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

module.exports = { cloudinary, uploadAudio, uploadImage };
