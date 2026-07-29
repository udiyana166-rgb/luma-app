const prisma = require('../services/prisma');

exports.getMatches = async (req, res) => {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userOneId: req.user.id }, { userTwoId: req.user.id }],
    },
    orderBy: { createdAt: 'desc' },
  });

  // Match бүрт "би биш нөгөө хэрэглэгч"-ийн профайл мэдээллийг хавсаргана
  // (өмнөх хувилбарт зөвхөн ID буцаадаг байсан тул frontend хэнтэй match хийснийг харуулах боломжгүй байсан)
  const enriched = await Promise.all(
    matches.map(async (m) => {
      const otherUserId = m.userOneId === req.user.id ? m.userTwoId : m.userOneId;
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, username: true, profile: true, photos: true },
        // ЧУХАЛ ЗАСВАР: өмнө нь include:{profile:true,photos:true} ашигладаг байсан бөгөөд
        // include нь бусад бүх default scalar талбарыг (password hash-ийг оролцуулаад) хамт буцаадаг.
        // select ашигласнаар зөвхөн шаардлагатай талбарууд л буцна.
      });
      return { ...m, otherUser };
    })
  );

  res.json(enriched);
};
