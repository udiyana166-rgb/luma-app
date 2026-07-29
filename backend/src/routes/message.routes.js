const router = require('express').Router();
const controller = require('../controllers/message.controller');
const auth = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');
const { validate, messageSchema } = require('../middleware/validate');

router.post('/', auth, validate(messageSchema), catchAsync(controller.sendMessage));
router.get('/:matchId', auth, catchAsync(controller.getMessages));

module.exports = router;
