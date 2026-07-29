// Prisma-гийн raw алдааг client рүү шууд дамжуулахгүй, аюулгүй мессеж болгож хувиргана.
function errorHandler(err, req, res, next) {
  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'талбар';
    return res.status(409).json({ message: `Энэ ${field} аль хэдийн ашиглагдаж байна` });
  }
  // Prisma "record not found" (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Олдсонгүй' });
  }

  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    message: err.publicMessage || 'Серверийн дотоод алдаа гарлаа',
  });
}

module.exports = errorHandler;
