const express = require('express');
const router = express.Router();
const controller = require('../controllers/emergency.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createContactSchema } = require('../validators/emergency.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize(['ADMIN']), validateRequest(createContactSchema), controller.create);
router.get('/', authenticate, controller.list);

module.exports = router;
