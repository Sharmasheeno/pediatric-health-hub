const express = require('express');
const router = express.Router();
const controller = require('../controllers/education.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createContentSchema } = require('../validators/education.validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize(['ADMIN']), validateRequest(createContentSchema), controller.create);
router.get('/', authenticate, controller.list);

module.exports = router;
