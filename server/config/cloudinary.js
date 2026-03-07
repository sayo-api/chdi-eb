const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Usa memoryStorage — sobe o buffer diretamente para o Cloudinary via stream
const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ok = ['audio/mpeg','audio/wav','audio/ogg','audio/mp4','audio/mp3','audio/x-m4a'];
    if (ok.includes(file.mimetype) || /\.(mp3|wav|ogg|m4a)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de áudio são permitidos (mp3, wav, ogg, m4a)'));
    }
  },
});

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

/**
 * Sobe um buffer para o Cloudinary via upload_stream.
 * @param {Buffer} buffer
 * @param {object} options  opções do cloudinary (folder, resource_type, public_id, etc.)
 * @returns {Promise<object>} resultado do cloudinary
 */
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
}

module.exports = { cloudinary, uploadAudio, uploadImage, uploadBuffer };
