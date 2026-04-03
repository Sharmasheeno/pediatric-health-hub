const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/telemetry', authenticate, dashboardController.getTelemetry);

module.exports = router;
