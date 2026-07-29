const router = require('express').Router();
const controller = require('../controllers/match.controller');
const auth = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');

router.get('/', auth, catchAsync(controller.getMatches));

module.exports = router;
