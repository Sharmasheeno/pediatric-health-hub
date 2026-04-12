const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/contacts', chatController.getRecentContacts);
router.get('/:targetUserId', chatController.getMessages);
router.post('/', chatController.sendMessage);

module.exports = router;
