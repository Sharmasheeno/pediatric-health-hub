const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { templateSchema } = require('../validators/chatbot.validator');

// Universal strict lockdown to ROOT level equivalents avoiding standard user penetration points
const strictAdmin = [authenticate, authorize(['ADMIN'])];

router.get('/telemetry', strictAdmin, adminController.getTelemetry);
router.get('/users', strictAdmin, adminController.getUsers);
router.post('/users/suspend', strictAdmin, adminController.toggleSuspension);
router.get('/audits', strictAdmin, adminController.getAudits);
router.get('/chatbot/templates', strictAdmin, adminController.getChatbotTemplates);
router.post('/chatbot/templates', strictAdmin, validateRequest(templateSchema), adminController.upsertChatbotTemplate);
router.delete('/chatbot/templates/:templateId', strictAdmin, adminController.deleteChatbotTemplate);

module.exports = router;
