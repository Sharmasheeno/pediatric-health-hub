const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller');
const validateRequest = require('../middlewares/validateRequest');
const { updateFacilitySchema } = require('../validators/facility.validator');
const { querySchema } = require('../validators/user.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, validateRequest(querySchema, 'query'), facilityController.getFacilities);
router.get('/:id', authenticate, facilityController.getFacility);
router.put('/:id', authenticate, authorize(['FACILITY', 'ADMIN']), validateRequest(updateFacilitySchema), facilityController.updateFacility);

module.exports = router;
