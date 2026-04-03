const doctorService = require('../services/doctor.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const getDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    return successResponse(res, doctor, 'Doctor fetched successfully');
  } catch (error) { next(error); }
};

const getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await doctorService.getAllDoctors(Number(page), Number(limit), search);
    return successResponse(res, result, 'Doctors fetched successfully');
  } catch (error) { next(error); }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    await logAction(req.user.id, 'UPDATE_PROFILE', 'DoctorProfile', doctor.id, null, req);
    return successResponse(res, doctor, 'Doctor updated successfully');
  } catch (error) { next(error); }
};

module.exports = { getDoctor, getDoctors, updateDoctor };
