const userService = require('../services/user.service');
const { successResponse } = require('../utils/responseWrapper');

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const result = await userService.getUsers(pageInt, limitInt, search);
    return successResponse(res, result, 'Users retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
    try {
        const doctors = await userService.getDoctors();
        return successResponse(res, doctors, 'Available doctors retrieved successfully', 200);
    } catch(err) { next(err); }
};

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        return successResponse(res, user, 'User manually created by Administrator', 201);
    } catch(err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
    try {
        const user = await userService.updateUserRole(req.params.id, req.body.role);
        return successResponse(res, user, 'User role successfully escalated or demoted', 200);
    } catch(err) { next(err); }
};

const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        return successResponse(res, null, 'User permanently eliminated from the system', 200);
    } catch(err) { next(err); }
};

module.exports = { getAllUsers, getDoctors, createUser, updateUserRole, deleteUser };
