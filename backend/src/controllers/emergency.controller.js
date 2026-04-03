const service = require('../services/emergency.service');
const { successResponse } = require('../utils/responseWrapper');

const create = async (req, res, next) => {
  try {
    const contact = await service.createContact(req.body);
    return successResponse(res, contact, 'Emergency contact mapped', 201);
  } catch(error){ next(error); }
};
const list = async (req, res, next) => {
  try {
    const contacts = await service.getContacts();
    return successResponse(res, contacts, 'Global SOS contacts delivered');
  } catch(error){ next(error); }
};

module.exports = { create, list };
