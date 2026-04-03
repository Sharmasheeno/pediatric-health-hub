const adminService = require('../services/admin.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const getTelemetry = async (req, res, next) => {
    try {
        const stats = await adminService.getTelemetry();
        return successResponse(res, stats, "Global application telemetry aggregated", 200);
    } catch(err) { next(err); }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await adminService.getUsers();
        return successResponse(res, users, "Unified identity tracking array returned", 200);
    } catch(err) { next(err); }
};

const toggleSuspension = async (req, res, next) => {
    try {
        const { userId, suspend } = req.body;
        const user = await adminService.toggleUserSuspension(userId, suspend);
        await logAction(req.user.id, suspend ? 'SUSPEND_USER' : 'UNSUSPEND_USER', 'User', userId, null, req);
        return successResponse(res, { id: user.id, isActive: user.isActive }, "User clearance toggled safely and audit-logged explicitly", 200);
    } catch(err) { next(err); }
};

const getAudits = async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 200;
        const audits = await adminService.getAudits(limit);
        return successResponse(res, audits, "HIPAA/SaaS Compliance Audit matrix returned chronologically", 200);
    } catch(err) { next(err); }
};

module.exports = { getTelemetry, getUsers, toggleSuspension, getAudits };
