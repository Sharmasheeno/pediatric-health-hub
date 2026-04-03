const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Universal strict lockdown to ROOT level equivalents avoiding standard user penetration points
const strictAdmin = [authenticate, authorize(['ADMIN'])];

router.get('/telemetry', strictAdmin, adminController.getTelemetry);
router.get('/users', strictAdmin, adminController.getUsers);
router.post('/users/suspend', strictAdmin, adminController.toggleSuspension);
router.get('/audits', strictAdmin, adminController.getAudits);

module.exports = router;
