const express = require('express');
const router = express.Router();
const tcController = require('../controllers/teleconsultation.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createRoomSchema, endRoomSchema } = require('../validators/teleconsultation.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/generate', authenticate, authorize(['DOCTOR', 'ADMIN', 'PARENT']), validateRequest(createRoomSchema), tcController.createRoom);
router.get('/:appointmentId', authenticate, tcController.getRoom);
router.patch('/:appointmentId/end', authenticate, authorize(['DOCTOR', 'ADMIN']), validateRequest(endRoomSchema), tcController.endRoom);

module.exports = router;
