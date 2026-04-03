const express = require('express');
const router = express.Router();
const growthController = require('../controllers/growth.controller');
const validateRequest = require('../middlewares/validateRequest');
const { addGrowthRecordSchema } = require('../validators/growth.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize(['PARENT', 'DOCTOR']), validateRequest(addGrowthRecordSchema), growthController.addRecord);
router.get('/child/:childId', authenticate, growthController.getRecords);

module.exports = router;
