const express = require('express');
const router = express.Router();
const childController = require('../controllers/child.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createChildSchema, updateChildSchema } = require('../validators/child.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize(['PARENT', 'ADMIN']), validateRequest(createChildSchema), childController.createChild);
router.get('/', authenticate, authorize(['DOCTOR', 'ADMIN']), childController.getAllChildren);
router.get('/my-children', authenticate, authorize(['PARENT']), childController.getMyChildren);
router.get('/:id', authenticate, childController.getChild); // Doctors, Parents and Admins mapping via application logic
router.put('/:id', authenticate, authorize(['PARENT', 'ADMIN']), validateRequest(updateChildSchema), childController.updateChild);

module.exports = router;
