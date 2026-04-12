const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const validateRequest = require('../middlewares/validateRequest');
const { updateDoctorSchema, createDoctorSchema } = require('../validators/doctor.validator');
const { querySchema } = require('../validators/user.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, validateRequest(querySchema, 'query'), doctorController.getDoctors);
router.get('/:id', authenticate, doctorController.getDoctor);
router.post('/', authenticate, authorize(['ADMIN', 'FACILITY']), validateRequest(createDoctorSchema), doctorController.createDoctor);
router.put('/:id', authenticate, authorize(['DOCTOR', 'ADMIN', 'FACILITY']), validateRequest(updateDoctorSchema), doctorController.updateDoctor);
router.delete('/:id', authenticate, authorize(['ADMIN', 'FACILITY']), doctorController.deleteDoctor);

module.exports = router;
