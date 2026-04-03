const express = require('express');
const router = express.Router();
const cbController = require('../controllers/chatbot.controller');
const validateRequest = require('../middlewares/validateRequest');
const { messageSchema, templateSchema } = require('../validators/chatbot.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Standard user interactions
router.post('/session', authenticate, authorize(['PARENT', 'DOCTOR', 'ADMIN']), cbController.initSession);
router.get('/:sessionId/history', authenticate, cbController.getHistory);
router.post('/:sessionId/chat', authenticate, validateRequest(messageSchema), cbController.sendQuery);

// Admin Moderation overrides
router.post('/templates', authenticate, authorize(['ADMIN']), validateRequest(templateSchema), cbController.manageTemplate);

module.exports = router;
