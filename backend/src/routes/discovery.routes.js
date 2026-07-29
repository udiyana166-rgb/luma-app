const router = require('express').Router();
const controller = require('../controllers/discovery.controller');
const auth = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');

router.get('/', auth, catchAsync(controller.getDiscovery));
router.get('/liked-me', auth, catchAsync(controller.getWhoLikedMe));

module.exports = router;
