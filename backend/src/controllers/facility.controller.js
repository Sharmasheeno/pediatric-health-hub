const facilityService = require('../services/facility.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const getFacility = async (req, res, next) => {
  try {
    const facility = await facilityService.getFacilityById(req.params.id);
    return successResponse(res, facility, 'Facility fetched successfully');
  } catch (error) { next(error); }
};

const getFacilities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await facilityService.getAllFacilities(Number(page), Number(limit), search);
    return successResponse(res, result, 'Facilities fetched successfully');
  } catch (error) { next(error); }
};

const createFacility = async (req, res, next) => {
    try {
        const facility = await facilityService.createFacility(req.body);
        await logAction(req.user.id, 'CREATE_PROFILE', 'FacilityProfile', facility.id, null, req);
        return successResponse(res, facility, 'Facility registered successfully', 201);
    } catch(err) { next(err); }
};

const deleteFacility = async (req, res, next) => {
    try {
        await facilityService.deleteFacility(req.params.id);
        await logAction(req.user.id, 'DELETE_PROFILE', 'FacilityProfile', req.params.id, null, req);
        return successResponse(res, null, 'Facility profile archived');
    } catch(err) { next(err); }
};

const updateFacility = async (req, res, next) => {
  try {
    const facility = await facilityService.updateFacility(req.params.id, req.body);
    await logAction(req.user.id, 'UPDATE_PROFILE', 'FacilityProfile', facility.id, null, req);
    return successResponse(res, facility, 'Facility updated successfully');
  } catch (error) { next(error); }
};

module.exports = { getFacility, getFacilities, createFacility, deleteFacility, updateFacility };
