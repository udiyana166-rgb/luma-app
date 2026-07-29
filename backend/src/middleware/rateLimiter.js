const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Хэт олон оролдлого хийлээ. Дараа дахин оролдоно уу.' },
});

module.exports = authLimiter;
