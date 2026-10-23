const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const settingsController = require('../controllers/systemSettings.controller');
const chatbotController = require('../controllers/chatbot.controller');
const { templateSchema } = require('../validators/chatbot.validator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Universal strict lockdown to ROOT level equivalents avoiding standard user penetration points
const strictAdmin = [authenticate, authorize(['ADMIN'])];

router.get('/telemetry', strictAdmin, adminController.getTelemetry);
router.get('/users', strictAdmin, adminController.getUsers);
router.post('/users/suspend', strictAdmin, adminController.toggleSuspension);
router.get('/audits', strictAdmin, adminController.getAudits);
router.get('/settings', strictAdmin, settingsController.getAdminSettings);
router.put('/settings', strictAdmin, settingsController.updateAdminSettings);
router.get('/chatbot/templates', strictAdmin, chatbotController.getTemplates);
router.post('/chatbot/templates', strictAdmin, validateRequest(templateSchema), chatbotController.manageTemplate);
router.put('/chatbot/templates/:templateId', strictAdmin, validateRequest(templateSchema), chatbotController.manageTemplate);
router.delete('/chatbot/templates/:templateId', strictAdmin, chatbotController.deleteTemplate);

module.exports = router;
