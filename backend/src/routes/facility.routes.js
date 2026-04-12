const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller');
const validateRequest = require('../middlewares/validateRequest');
const { updateFacilitySchema, createFacilitySchema } = require('../validators/facility.validator');
const { querySchema } = require('../validators/user.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, validateRequest(querySchema, 'query'), facilityController.getFacilities);
router.get('/:id', authenticate, facilityController.getFacility);
router.post('/', authenticate, authorize(['ADMIN']), validateRequest(createFacilitySchema), facilityController.createFacility);
router.put('/:id', authenticate, authorize(['FACILITY', 'ADMIN']), validateRequest(updateFacilitySchema), facilityController.updateFacility);
router.delete('/:id', authenticate, authorize(['ADMIN']), facilityController.deleteFacility);

module.exports = router;
