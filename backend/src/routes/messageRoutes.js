const express = require('express');
const messageController = require('../controllers/messageController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { sendMessageSchema } = require('../validators/messageValidator');

const router = express.Router();

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.post('/', validate(sendMessageSchema), messageController.sendMessage);
router.get('/:userId', messageController.getMessages);

module.exports = router;