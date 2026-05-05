const growthService = require('../services/growthRecord.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const createRecord = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      recordedById: req.user.id,
      recorderRole: req.user.role
    };
    const record = await growthService.addGrowthRecord(payload);
    await logAction(req.user.id, 'ADD_GROWTH_METRIC', 'GrowthRecord', record.id, null, req);
    return successResponse(res, record, 'Growth metric added', 201);
  } catch (error) { next(error); }
};

const getChildGrowth = async (req, res, next) => {
  try {
    const records = await growthService.getGrowthByChild(req.params.childId);
    return successResponse(res, records, 'Growth tracking timeseries accessed');
  } catch (error) { next(error); }
};

module.exports = { createRecord, getChildGrowth };
