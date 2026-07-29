const prisma = require('../services/prisma');

async function assertUserInMatch(matchId, userId) {
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
  });
  return !!match;
}

// Send message
exports.sendMessage = async (req, res) => {
  const { matchId, text } = req.body;

  // ЧУХАЛ ЗАСВАР: өмнөх хувилбарт энэ шалгалт байхгүй байсан тул
  // хэн ч бусдын match-ийн matchId-г таамаглаад мессеж бичих боломжтой байсан.
  const isMember = await assertUserInMatch(matchId, req.user.id);
  if (!isMember) {
    return res.status(403).json({ message: 'Энэ чатад мессеж бичих эрхгүй байна' });
  }

  const message = await prisma.message.create({
    data: { matchId, senderId: req.user.id, text },
  });

  res.status(201).json(message);
};

// Get messages
exports.getMessages = async (req, res) => {
  const { matchId } = req.params;

  const isMember = await assertUserInMatch(matchId, req.user.id);
  if (!isMember) {
    return res.status(403).json({ message: 'Энэ чатыг үзэх эрхгүй байна' });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: 'asc' },
  });

  res.json(messages);
};
