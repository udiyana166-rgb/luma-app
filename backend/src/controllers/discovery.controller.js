const prisma = require('../services/prisma');

exports.getDiscovery = async (req, res) => {
  // Аль хэдийн swipe хийсэн хэрэглэгчдийн ID-г цуглуулна
  const mySwipes = await prisma.swipe.findMany({
    where: { fromUserId: req.user.id },
    select: { toUserId: true },
  });
  const alreadySwipedIds = mySwipes.map((s) => s.toUserId);

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: req.user.id,
        notIn: alreadySwipedIds, // өмнө нь swipe хийсэн хүмүүсийг дахин үзүүлэхгүй
      },
      isActive: true,
      profile: { isNot: null }, // профайл үүсгээгүй хэрэглэгчийг харуулахгүй
    },
    select: {
      id: true,
      username: true,
      profile: true,
      photos: true,
      boostedUntil: true,
      // ЧУХАЛ: select ашигласнаар "password" талбар хэзээ ч client рүү явахгүй.
      // Өмнөх хувилбарт select огт байгаагүй тул Prisma анхдагчаар БҮХ талбар
      // (нууц үгний hash-ийг оролцуулаад) буцаадаг байсан — том аюулгүй байдлын цоорхой.
    },
    orderBy: [{ boostedUntil: 'desc' }], // Boost идэвхтэй профайлууд эхэнд гарна
    take: 20,
  });

  const now = new Date();
  const sanitized = users.map((u) => ({
    ...u,
    isBoosted: !!(u.boostedUntil && u.boostedUntil > now),
    boostedUntil: undefined,
  }));

  res.json(sanitized);
};

// Premium feature: надад LIKE хийсэн ч би хараахан swipe хийгээгүй хүмүүсийг харуулна
exports.getWhoLikedMe = async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { isPremium: true, premiumExpiresAt: true },
  });
  const isPremiumActive = me.isPremium && (!me.premiumExpiresAt || me.premiumExpiresAt > new Date());

  if (!isPremiumActive) {
    return res.status(402).json({
      message: 'Хэн танд лайк дарснаа харахын тулд Premium захиалга хэрэгтэй',
      upgradeRequired: true,
    });
  }

  // Аль хэдийн би тэдэнд swipe хийсэн хүмүүсийг жагсаалтаас хасна (match болсон эсвэл passed хүмүүс энд харагдахгүй)
  const mySwipes = await prisma.swipe.findMany({
    where: { fromUserId: req.user.id },
    select: { toUserId: true },
  });
  const alreadySwipedIds = mySwipes.map((s) => s.toUserId);

  const likesReceived = await prisma.swipe.findMany({
    where: {
      toUserId: req.user.id,
      action: { in: ['LIKE', 'SUPERLIKE'] },
      fromUserId: { notIn: alreadySwipedIds },
    },
    select: {
      action: true,
      createdAt: true,
      fromUser: { select: { id: true, username: true, profile: true, photos: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(likesReceived);
