const prisma = require('../services/prisma');

exports.createProfile = async (req, res) => {
  // upsert ашигласнаар хоёр дахь удаа дуудвал алдаа шидэхгүй, зүгээр шинэчилнэ
  const profile = await prisma.profile.upsert({
    where: { userId: req.user.id },
    update: req.body,
    create: { userId: req.user.id, ...req.body },
  });

  res.status(201).json(profile);
};

exports.getProfile = async (req, res) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { id: true, email: true, username: true, photos: true } } },
  });

  if (!profile) {
    return res.status(404).json({ message: 'Профайл үүсгээгүй байна' });
  }

  res.json(profile);
};

exports.updateProfile = async (req, res) => {
  // req.body нь validate middleware-ээр аль хэдийн шүүгдсэн тул
  // зөвхөн bio/age/city/relationshipGoal л агуулна — userId зэрэг field дамжуулах боломжгүй
  const updated = await prisma.profile.update({
    where: { userId: req.user.id },
    data: req.body,
  });

  res.json(updated);
};
