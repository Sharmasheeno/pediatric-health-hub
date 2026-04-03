const parentService = require('../services/parent.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const getParent = async (req, res, next) => {
  try {
    const parent = await parentService.getParentById(req.params.id);
    return successResponse(res, parent, 'Parent fetched successfully');
  } catch (error) { next(error); }
};

const updateParent = async (req, res, next) => {
  try {
    const parent = await parentService.updateParent(req.params.id, req.body);
    await logAction(req.user.id, 'UPDATE_PROFILE', 'ParentProfile', parent.id, null, req);
    return successResponse(res, parent, 'Parent updated successfully');
  } catch (error) { next(error); }
};

module.exports = { getParent, updateParent };
