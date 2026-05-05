const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validateRequest = require('../middlewares/validateRequest');
const { querySchema, createUserSchema } = require('../validators/user.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, authorize(['ADMIN']), validateRequest(querySchema, 'query'), userController.getAllUsers);
router.get('/doctors', authenticate, authorize(['PARENT', 'ADMIN']), userController.getDoctors);
router.post('/', authenticate, authorize(['ADMIN']), validateRequest(createUserSchema), userController.createUser);
router.put('/:id/role', authenticate, authorize(['ADMIN']), userController.updateUserRole);
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.deleteUser);

module.exports = router;
