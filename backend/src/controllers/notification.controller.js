const service = require('../services/notification.service');
const { successResponse } = require('../utils/responseWrapper');

const notify = async (req, res, next) => {
  try {
    const note = await service.createNotification(req.body);
    return successResponse(res, note, 'Notification dispatched', 201);
  } catch(error){ next(error); }
};

const getMine = async (req, res, next) => {
  try {
    const list = await service.getUserNotifications(req.user.id);
    return successResponse(res, list, "Inbox retrieved");
  } catch(error){ next(error); }
};

const read = async (req, res, next) => {
  try {
    const note = await service.markAsRead(req.params.id);
    return successResponse(res, note, 'Marked as read');
  } catch(error){ next(error); }
};

module.exports = { notify, getMine, read };
