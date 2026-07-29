const router = require('express').Router();
const controller = require('../controllers/billing.controller');
const auth = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');

router.post('/checkout/premium', auth, catchAsync(controller.createPremiumCheckout));
router.post('/checkout/boost', auth, catchAsync(controller.createBoostCheckout));
router.get('/status', auth, catchAsync(controller.getBillingStatus));

module.exports = router;
