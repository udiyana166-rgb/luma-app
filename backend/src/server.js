require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const swipeRoutes = require('./routes/swipe.routes');
const matchRoutes = require('./routes/match.routes');
const messageRoutes = require('./routes/message.routes');
const uploadRoutes = require('./routes/upload.routes'); // ← өмнө нь огт байгаагүй
const billingRoutes = require('./routes/billing.routes'); // ← monetization (Stripe)
const billingController = require('./controllers/billing.controller');
const catchAsync = require('./utils/catchAsync');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet()); // ← өмнө нь байгаагүй, аюулгүй байдлын header-үүд
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // production дээр FRONTEND_URL-ээ заавал тохируулна
  credentials: true,
}));

// ЧУХАЛ: Stripe webhook-ийг express.json()-ээс ӨМНӨ, raw body хэлбэрээр бүртгэнэ.
// Stripe-ийн гарын үсэг (signature) шалгахад parse хийгээгүй raw byte шаардлагатай тул
// хэрэв express.json()-ийн дараа байрлуулбал webhook signature шалгалт үргэлж алдаа өгнө.
app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  catchAsync(billingController.handleWebhook)
);

app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Luma API running 💗' });
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes); // ← өмнө нь mobile app дуудаж байсан ч энэ route байгаагүй
app.use('/api/billing', billingRoutes); // ← monetization endpoints (checkout, status)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route олдсонгүй' });
});

// Глобал error handler — ЗААВАЛ бусад бүх app.use()-ийн ХАМГИЙН СҮҮЛД байрлана
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Luma server running on port ${PORT}`);
});
