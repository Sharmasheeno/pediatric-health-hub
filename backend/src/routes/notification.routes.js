const express = require('express');
const router = express.Router();
const controller = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, controller.getMine);
router.patch('/:id/read', authenticate, controller.read);

module.exports = router;
