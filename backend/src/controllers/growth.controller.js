const growthService = require('../services/growth.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const addRecord = async (req, res, next) => {
    try {
        // req.user.role is injected via authentication strictly mapping truth
        const record = await growthService.addRecord(req.user.id, req.user.role, req.body);
        await logAction(req.user.id, 'ADD_GROWTH_METRIC', 'GrowthRecord', record.id, { role: req.user.role }, req);
        return successResponse(res, record, "Metrics logged securely and irrevocably mapped to author", 201);
    } catch(err) { next(err); }
};

const getRecords = async (req, res, next) => {
    try {
        const data = await growthService.getRecordsByChild(req.params.childId);
        return successResponse(res, data, "Metrics timeline and chart array decoded successfully", 200);
    } catch(err) { next(err); }
};

module.exports = { addRecord, getRecords };
