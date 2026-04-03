const childService = require('../services/child.service');
const { logAction } = require('../services/audit.service');
const { successResponse, errorResponse } = require('../utils/responseWrapper');

const createChild = async (req, res, next) => {
  try {
    // Only PARENT can logically own a child, so find their ParentProfile ID
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const parent = await prisma.parentProfile.findUnique({ where: { userId: req.user.id } });
    
    if (!parent && req.user.role !== 'ADMIN') {
        return errorResponse(res, 'Only verified parents can register children', 403);
    }
    
    // Fallback: If Admin creating it on behalf, parentId should be in body, else from auth token.
    const parentId = req.body.parentId || parent.id;
    if (req.body.parentId) delete req.body.parentId; // Clean for prisma execution
    
    const child = await childService.createChild(parentId, req.body);
    await logAction(req.user.id, 'CREATE', 'Child', child.id, null, req);
    return successResponse(res, child, 'Child registered successfully', 201);
  } catch (error) { next(error); }
};

const getChild = async (req, res, next) => {
  try {
    const child = await childService.getChildById(req.params.id);
    await logAction(req.user.id, 'READ', 'Child_Detailed_History', child.id, null, req);
    return successResponse(res, child, 'Child profile retrieved');
  } catch (error) { next(error); }
};

const getMyChildren = async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const parent = await prisma.parentProfile.findUnique({ where: { userId: req.user.id } });
    if(!parent) return errorResponse(res, 'No parent profile linked', 404);

    const children = await childService.getChildrenByParent(parent.id);
    return successResponse(res, children, 'Children retrieved');
  } catch (error) { next(error); }
};

const updateChild = async (req, res, next) => {
  try {
    const child = await childService.updateChild(req.params.id, req.body);
    await logAction(req.user.id, 'UPDATE', 'Child', child.id, null, req);
    return successResponse(res, child, 'Child updated successfully');
  } catch (error) { next(error); }
};

const getAllChildren = async (req, res, next) => {
  try {
    const children = await childService.getAllChildren();
    return successResponse(res, children, 'System-wide children records retrieved successfully');
  } catch (error) { next(error); }
};

module.exports = { createChild, getChild, getMyChildren, updateChild, getAllChildren };
