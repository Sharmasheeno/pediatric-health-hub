const service = require('../services/education.service');
const { successResponse } = require('../utils/responseWrapper');

const create = async (req, res, next) => {
  try {
    const content = await service.createContent(req.body);
    return successResponse(res, content, 'Educational material published', 201);
  } catch(error){ next(error); }
};
const list = async (req, res, next) => {
  try {
    const list = await service.getPublishedContent();
    return successResponse(res, list, 'Library fetched');
  } catch(error){ next(error); }
};

module.exports = { create, list };
