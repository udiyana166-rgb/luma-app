const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const catchAsync = require('../utils/catchAsync');
const authLimiter = require('../middleware/rateLimiter');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');

router.post('/register', authLimiter, validate(registerSchema), catchAsync(controller.register));
router.post('/login', authLimiter, validate(loginSchema), catchAsync(controller.login));

module.exports = router;
