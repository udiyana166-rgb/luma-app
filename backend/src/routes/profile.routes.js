const router = require('express').Router();
const controller = require('../controllers/profile.controller');
const auth = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');
const { validate, profileSchema } = require('../middleware/validate');

router.post('/', auth, validate(profileSchema), catchAsync(controller.createProfile));
router.get('/', auth, catchAsync(controller.getProfile));
router.put('/', auth, validate(profileSchema), catchAsync(controller.updateProfile));

module.exports = router;
