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

const assertAppointmentParticipant = async (user, appointment) => {
    if (!appointment || appointment.deletedAt) {
        throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });
    }
    if (user.role === 'ADMIN') return;

    const isParent = user.role === 'PARENT' && await checkParentOwnership(user.id, appointment.childId);
    const isDoctor = user.role === 'DOCTOR' && await checkDoctorOwnership(user.id, appointment.doctorId);
    if (!isParent && !isDoctor) {
        throw Object.assign(new Error('You are not a participant in this appointment.'), { statusCode: 403 });
    }
};

const createRoom = async (req, res, next) => {
    try {
        const appointment = await prisma.appointment.findUnique({ where: { id: req.body.appointmentId } });
        await assertAppointmentParticipant(req.user, appointment);
        const room = await tcService.generateRoom(req.body.appointmentId);
        await logAction(req.user.id, 'CREATE_TELECONSULT_ROOM', 'Teleconsultation', room.id, null, req);
        return successResponse(res, room, "Virtual room generated securely with explicit time restrictions", 201);
    } catch(err) { next(err); }
};

const getRoom = async (req, res, next) => {
    try {
        const room = await tcService.getRoomAccess(req.params.appointmentId);
        
        await assertAppointmentParticipant(req.user, room.appointment);

        return successResponse(res, room, "Access granted to secure transmission room", 200);
    } catch(err) { next(err); }
};

const endRoom = async (req, res, next) => {
    try {
        const appointment = await prisma.appointment.findUnique({ where: { id: req.params.appointmentId } });
        await assertAppointmentParticipant(req.user, appointment);
        const room = await tcService.endRoom(req.params.appointmentId, req.body.notes);
        await logAction(req.user.id, 'END_TELECONSULT_ROOM', 'Teleconsultation', room.id, null, req);
        return successResponse(res, room, "Room legally terminated and locked", 200);
    } catch(err) { next(err); }
};

module.exports = { createRoom, getRoom, endRoom };
