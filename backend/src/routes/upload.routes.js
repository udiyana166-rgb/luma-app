const router = require('express').Router();
const multer = require('multer');
const controller = require('../controllers/upload.controller');
const auth = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');

// Диск дээр биш санах ойд түр хадгалаад шууд Cloudinary руу stream хийнэ
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB хязгаар
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Зөвхөн зургийн файл оруулах боломжтой'));
    }
    cb(null, true);
  },
});

router.post('/photo', auth, upload.single('image'), catchAsync(controller.uploadPhoto));

module.exports = router;
