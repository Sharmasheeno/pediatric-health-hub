const recordService = require('../services/medicalRecord.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body);
    await logAction(req.user.id, 'CREATE_CLINICAL_RECORD', 'MedicalRecord', record.id, null, req);
    return successResponse(res, record, 'Medical record created successfully', 201);
  } catch (error) { next(error); }
};

const getChildRecords = async (req, res, next) => {
  try {
    const records = await recordService.getRecordsByChild(req.params.childId);
    return successResponse(res, records, 'Medical records retrieved efficiently');
  } catch (error) { next(error); }
};

module.exports = { createRecord, getChildRecords };
