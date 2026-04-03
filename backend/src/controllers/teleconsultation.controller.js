const tcService = require('../services/teleconsultation.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const checkParentOwnership = async (userId, childId) => {
    const p = await prisma.parentProfile.findUnique({ where: { userId }});
    if(!p) return false;
    const c = await prisma.child.findFirst({ where: { id: childId, parentId: p.id } });
    return !!c;
};

const checkDoctorOwnership = async (userId, doctorId) => {
    const d = await prisma.doctorProfile.findUnique({ where: { userId }});
    return d && d.id === doctorId;
};

const createRoom = async (req, res, next) => {
    try {
        const room = await tcService.generateRoom(req.body.appointmentId);
        await logAction(req.user.id, 'CREATE_TELECONSULT_ROOM', 'Teleconsultation', room.id, null, req);
        return successResponse(res, room, "Virtual room generated securely with explicit time restrictions", 201);
    } catch(err) { next(err); }
};

const getRoom = async (req, res, next) => {
    try {
        const room = await tcService.getRoomAccess(req.params.appointmentId);
        
        // Strict Authorization checks mapping implicitly to physical relationships
        if (req.user.role === 'PARENT') {
            const childBelongs = await checkParentOwnership(req.user.id, room.appointment.childId);
            if (!childBelongs) throw Object.assign(new Error("Unauthorized lateral access to secure session."), { statusCode: 403 });
        } else if (req.user.role === 'DOCTOR') {
            const doctorMatches = await checkDoctorOwnership(req.user.id, room.appointment.doctorId);
            if (!doctorMatches) throw Object.assign(new Error("Unauthorized lateral access to secure session."), { statusCode: 403 });
        }

        return successResponse(res, room, "Access granted to secure transmission room", 200);
    } catch(err) { next(err); }
};

const endRoom = async (req, res, next) => {
    try {
        const room = await tcService.endRoom(req.params.appointmentId, req.body.notes);
        await logAction(req.user.id, 'END_TELECONSULT_ROOM', 'Teleconsultation', room.id, null, req);
        return successResponse(res, room, "Room legally terminated and locked", 200);
    } catch(err) { next(err); }
};

module.exports = { createRoom, getRoom, endRoom };
