const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../services/prisma');

exports.register = async (req, res) => {
  const { email, username, password } = req.body;

  // Имэйл болон хэрэглэгчийн нэрийг хоёуланг нь шалгана (өмнө нь зөвхөн имэйл шалгадаг байсан)
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    const field = existing.email === email ? 'имэйл' : 'хэрэглэгчийн нэр';
    return res.status(409).json({ message: `Энэ ${field} аль хэдийн ашиглагдаж байна` });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, username, password: hash },
  });

  res.status(201).json({ message: 'Account created', id: user.id });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Аюулгүй байдлын үүднээс "имэйл олдсонгүй" vs "нууц үг буруу"-г ялгахгүй
  if (!user) {
    return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'Энэ бүртгэл идэвхгүй болгогдсон байна' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({ token, user: { id: user.id, username: user.username } });
};
