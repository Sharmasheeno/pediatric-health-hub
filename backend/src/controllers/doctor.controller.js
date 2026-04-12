const doctorService = require('../services/doctor.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    return successResponse(res, doctor, 'Doctor fetched successfully');
  } catch (error) { next(error); }
};

const getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    let facilityId = req.query.facilityId;
    
    if (req.user.role === 'FACILITY') {
        const profile = await prisma.facilityProfile.findUnique({ where: { userId: req.user.id } });
        if (profile) facilityId = profile.id;
    }

    const result = await doctorService.getAllDoctors(Number(page), Number(limit), search, facilityId);
    return successResponse(res, result, 'Doctors fetched successfully');
  } catch (error) { next(error); }
};

const createDoctor = async (req, res, next) => {
    try {
        if (req.user.role === 'FACILITY') {
            const profile = await prisma.facilityProfile.findUnique({ where: { userId: req.user.id } });
            if (profile) req.body.facilityId = profile.id;
        }
        
        const doctor = await doctorService.createDoctor(req.body);
        await logAction(req.user.id, 'CREATE_PROFILE', 'DoctorProfile', doctor.id, null, req);
        return successResponse(res, doctor, 'Doctor registered successfully', 201);
    } catch(err) { next(err); }
};

const deleteDoctor = async (req, res, next) => {
    try {
        await doctorService.deleteDoctor(req.params.id);
        await logAction(req.user.id, 'DELETE_PROFILE', 'DoctorProfile', req.params.id, null, req);
        return successResponse(res, null, 'Doctor profile archived');
    } catch(err) { next(err); }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    await logAction(req.user.id, 'UPDATE_PROFILE', 'DoctorProfile', doctor.id, null, req);
    return successResponse(res, doctor, 'Doctor updated successfully');
  } catch (error) { next(error); }
};

module.exports = { getDoctor, getDoctors, createDoctor, deleteDoctor, updateDoctor };
