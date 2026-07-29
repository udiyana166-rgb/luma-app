const Stripe = require('stripe');
const prisma = require('../services/prisma');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Хэрэглэгчийн Stripe Customer ID-г олоод, байхгүй бол шинээр үүсгэнэ
async function getOrCreateStripeCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// Сарын Premium захиалга худалдаж авах Checkout session үүсгэнэ
exports.createPremiumCheckout = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const customerId = await getOrCreateStripeCustomer(user);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.APP_BASE_URL}/?premium=success`,
    cancel_url: `${process.env.APP_BASE_URL}/?premium=cancel`,
    metadata: { userId: user.id, type: 'premium' },
  });

  res.json({ checkoutUrl: session.url });
};

// Нэг удаагийн "Boost" худалдаж авах Checkout session үүсгэнэ
exports.createBoostCheckout = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const customerId = await getOrCreateStripeCustomer(user);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_BOOST_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.APP_BASE_URL}/?boost=success`,
    cancel_url: `${process.env.APP_BASE_URL}/?boost=cancel`,
    metadata: { userId: user.id, type: 'boost' },
  });

  res.json({ checkoutUrl: session.url });
};

// Одоогийн Premium/Boost статусаа шалгах
exports.getBillingStatus = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { isPremium: true, premiumExpiresAt: true, boostedUntil: true },
  });
  res.json(user);
};

// Stripe webhook — Checkout амжилттай дуусах, subscription шинэчлэгдэх/цуцлагдах үед дуудагдана.
// ЧУХАЛ: энэ route express.json() middleware-ээс ӨМНӨ raw body хэлбэрээр авах ёстой
// (server.js дотор тусад нь тохируулсан — signature шалгахад raw byte шаардлагатай)
exports.handleWebhook = async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const type = session.metadata?.type;
      if (!userId) break;

      if (type === 'premium') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            stripeSubscriptionId: subscription.id,
            premiumExpiresAt: new Date(subscription.current_period_end * 1000),
          },
        });
      } else if (type === 'boost') {
        const boostUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 минутын boost
        await prisma.user.update({ where: { id: userId }, data: { boostedUntil: boostUntil } });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const user = await prisma.user.findUnique({ where: { stripeSubscriptionId: subscription.id } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPremium: subscription.status === 'active',
            premiumExpiresAt: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const user = await prisma.user.findUnique({ where: { stripeSubscriptionId: subscription.id } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isPremium: false, stripeSubscriptionId: null },
        });
      }
      break;
    }

    default:
      break; // бусад event-үүдийг үл тоомсорлоно
  }

  res.json({ received: true });
};
