const router = require('express').Router();
const controller = require('../controllers/swipe.controller');
const auth = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');
const { validate, swipeSchema } = require('../middleware/validate');

router.post('/', auth, validate(swipeSchema), catchAsync(controller.swipe));

module.exports = router;
