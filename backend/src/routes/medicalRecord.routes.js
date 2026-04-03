const express = require('express');
const router = express.Router();
const recordController = require('../controllers/medicalRecord.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createMedicalRecordSchema } = require('../validators/medicalRecord.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize(['DOCTOR', 'ADMIN']), validateRequest(createMedicalRecordSchema), recordController.createRecord);
router.get('/child/:childId', authenticate, recordController.getChildRecords); 

module.exports = router;
