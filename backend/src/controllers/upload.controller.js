const cloudinary = require('cloudinary').v2;
const prisma = require('../services/prisma');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.uploadPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Зураг олдсонгүй' });
  }

  // Санамсаргүй урсгалыг Cloudinary руу stream хийж upload хийнэ (диск дээр түр хадгалахгүй)
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `luma/profile-photos/${req.user.id}`, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

  const existingCount = await prisma.photo.count({ where: { userId: req.user.id } });
  if (existingCount >= 6) {
    return res.status(400).json({ message: 'Дээд тал нь 6 зураг оруулах боломжтой' });
  }

  const photo = await prisma.photo.create({
    data: {
      userId: req.user.id,
      url: uploadResult.secure_url,
      isMain: existingCount === 0, // эхний зураг автоматаар үндсэн зураг болно
    },
  });

  res.status(201).json(photo);
};
