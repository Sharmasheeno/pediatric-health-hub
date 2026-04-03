const hrService = require('../services/healthRecord.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

// PARENT-FACING APIs
const addAllergy = async (req, res, next) => {
  try {
    const allergy = await hrService.createAllergy(req.body);
    await logAction(req.user.id, 'ADD_ALLERGY', 'Allergy', allergy.id, null, req);
    return successResponse(res, allergy, 'Allergy record added', 201);
  } catch (error) { next(error); }
};

const addMedication = async (req, res, next) => {
  try {
    const med = await hrService.createMedication(req.body);
    await logAction(req.user.id, 'ADD_MEDICATION', 'Medication', med.id, null, req);
    return successResponse(res, med, 'Medication logged', 201);
  } catch (error) { next(error); }
};

const addIllness = async (req, res, next) => {
  try {
    const illness = await hrService.createIllness(req.body);
    await logAction(req.user.id, 'ADD_ILLNESS_HISTORY', 'IllnessHistory', illness.id, null, req);
    return successResponse(res, illness, 'Past illness recorded', 201);
  } catch (error) { next(error); }
};

const getParentRecords = async (req, res, next) => {
  try {
    const records = await hrService.getParentRecordsByChild(req.params.childId);
    return successResponse(res, records, 'Child baseline records retrieved');
  } catch (error) { next(error); }
};

// DOCTOR-FACING APIs
const addConsultation = async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const docProfile = await prisma.doctorProfile.findUnique({ where: { userId: req.user.id } });
    
    if (!docProfile) throw Object.assign(new Error('Restricted to authorized doctors'), { statusCode: 403 });

    const note = await hrService.createConsultationNote(docProfile.id, req.body);
    await logAction(req.user.id, 'CREATE_CONSULTATION', 'ConsultationNote', note.id, null, req);
    return successResponse(res, note, 'Official consultation note signed and archived', 201);
  } catch (error) { next(error); }
};

const getConsultations = async (req, res, next) => {
  try {
    const history = await hrService.getConsultationsByChild(req.params.childId);
    return successResponse(res, history, 'Full medical consultation history retrieved');
  } catch (error) { next(error); }
};

module.exports = { addAllergy, addMedication, addIllness, getParentRecords, addConsultation, getConsultations };
