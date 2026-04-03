const express = require('express');
const router = express.Router();
const hrController = require('../controllers/healthRecord.controller');
const validateRequest = require('../middlewares/validateRequest');
const validators = require('../validators/healthRecord.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// PARENT DATA API
router.post('/allergies', authenticate, authorize(['PARENT', 'ADMIN']), validateRequest(validators.createAllergySchema), hrController.addAllergy);
router.post('/medications', authenticate, authorize(['PARENT', 'ADMIN']), validateRequest(validators.createMedicationSchema), hrController.addMedication);
router.post('/illnesses', authenticate, authorize(['PARENT', 'ADMIN']), validateRequest(validators.createIllnessSchema), hrController.addIllness);
router.get('/child/:childId/baseline', authenticate, hrController.getParentRecords);

// DOCTOR (SECURE) API
router.post('/consultations', authenticate, authorize(['DOCTOR']), validateRequest(validators.createConsultationSchema), hrController.addConsultation);
router.get('/child/:childId/consultations', authenticate, hrController.getConsultations); // Both parents and doctors can READ this depending on explicit ownership later.

module.exports = router;
