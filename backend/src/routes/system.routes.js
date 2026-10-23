const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/systemSettings.controller');

router.get('/branding', settingsController.getPublicBranding);

module.exports = router;
