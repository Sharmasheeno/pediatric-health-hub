const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parent.controller');
const validateRequest = require('../middlewares/validateRequest');
const { updateParentSchema } = require('../validators/parent.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/:id', authenticate, authorize(['PARENT', 'ADMIN', 'DOCTOR']), parentController.getParent);
router.put('/:id', authenticate, authorize(['PARENT', 'ADMIN']), validateRequest(updateParentSchema), parentController.updateParent);

module.exports = router;
