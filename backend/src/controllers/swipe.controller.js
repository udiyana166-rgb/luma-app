const prisma = require('../services/prisma');

const FREE_DAILY_SWIPE_LIMIT = 20;

function isPremiumActive(user) {
  return user.isPremium && (!user.premiumExpiresAt || user.premiumExpiresAt > new Date());
}

exports.swipe = async (req, res) => {
  const { targetUserId, action } = req.body; // action: 'LIKE' | 'PASS' | 'SUPERLIKE'

  if (targetUserId === req.user.id) {
    return res.status(400).json({ message: 'Өөрийгөө swipe хийх боломжгүй' });
  }

  const me = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, isPremium: true, premiumExpiresAt: true },
  });

  // Monetization gate: үнэгүй хэрэглэгч өдөрт хязгаарлагдмал swipe хийнэ, Premium хязгааргүй
  if (!isPremiumActive(me)) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysSwipeCount = await prisma.swipe.count({
      where: { fromUserId: req.user.id, createdAt: { gte: startOfDay } },
    });
    if (todaysSwipeCount >= FREE_DAILY_SWIPE_LIMIT) {
      return res.status(402).json({
        message: `Өдрийн үнэгүй swipe хязгаар (${FREE_DAILY_SWIPE_LIMIT}) дуусгавар боллоо. Premium-руу шинэчлэн хязгааргүй swipe хийгээрэй.`,
        upgradeRequired: true,
      });
    }
  }

  // upsert ашигласнаар хэрэглэгч давхар товшсон ч алдаа шидэхгүй (schema-д unique constraint нэмсэн)
  const swipe = await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: req.user.id, toUserId: targetUserId } },
    update: { action },
    create: { fromUserId: req.user.id, toUserId: targetUserId, action },
  });

  if (action === 'LIKE' || action === 'SUPERLIKE') {
    const reverse = await prisma.swipe.findUnique({
      where: { fromUserId_toUserId: { fromUserId: targetUserId, toUserId: req.user.id } },
    });

    if (reverse && (reverse.action === 'LIKE' || reverse.action === 'SUPERLIKE')) {
      const [userOneId, userTwoId] = [req.user.id, targetUserId].sort();

      const match = await prisma.match.upsert({
        where: { userOneId_userTwoId: { userOneId, userTwoId } },
        update: {},
        create: { userOneId, userTwoId, compatibilityScore: 85 },
      });

      const otherUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, username: true, profile: true, photos: true },
      });

      return res.json({ message: 'MATCH 💗', match, otherUser });
    }
  }

  res.json(swipe);
};
