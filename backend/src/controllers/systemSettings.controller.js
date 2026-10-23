const settingsService = require('../services/systemSettings.service');
const { settingsSchema, validateLogo } = require('../validators/systemSettings.validator');
const { logAction } = require('../services/audit.service');
const { successResponse, errorResponse } = require('../utils/responseWrapper');

const getAdminSettings = async (req, res, next) => {
  try {
    return successResponse(res, await settingsService.getSettings(), 'Organization settings loaded', 200);
  } catch (error) { next(error); }
};

const updateAdminSettings = async (req, res, next) => {
  try {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, parsed.error.issues[0]?.message || 'Invalid settings', 400);
    if (!validateLogo(parsed.data.logoDataUrl)) return errorResponse(res, 'Use a PNG, JPEG, or WebP logo no larger than 1 MB', 400);

    const settings = await settingsService.updateSettings(parsed.data, req.user.id);
    await logAction(req.user.id, 'UPDATE_SYSTEM_SETTINGS', 'SystemSettings', '1', {
      organizationName: settings.organizationName,
      primaryColor: settings.primaryColor,
      assistantName: settings.assistantName
    }, req);
    return successResponse(res, settings, 'Organization settings saved', 200);
  } catch (error) { next(error); }
};

const getPublicBranding = async (req, res, next) => {
  try {
    return successResponse(res, await settingsService.getPublicBranding(), 'Public organization branding loaded', 200);
  } catch (error) { next(error); }
};

module.exports = { getAdminSettings, updateAdminSettings, getPublicBranding };
