const express = require('express');
const router = express.Router();
const vaccineController = require('../controllers/vaccination.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createTemplateSchema, updateVaccinationStatusSchema } = require('../validators/vaccination.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Admin Protocol Mappings
router.post('/templates', authenticate, authorize(['ADMIN']), validateRequest(createTemplateSchema), vaccineController.createTemplate);
router.get('/templates', authenticate, vaccineController.getTemplates);

// Child Instance Tracking
router.post('/child/:childId/generate', authenticate, authorize(['PARENT', 'DOCTOR', 'ADMIN']), vaccineController.generateSchedule);
router.get('/child/:childId', authenticate, vaccineController.getSchedule);

// Clinical Check-off
router.patch('/:id/status', authenticate, authorize(['DOCTOR', 'FACILITY', 'ADMIN']), validateRequest(updateVaccinationStatusSchema), vaccineController.updateVaccineEvent);

module.exports = router;
