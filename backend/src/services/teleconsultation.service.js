const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateRoom = async (appointmentId) => {
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt) {
       throw Object.assign(new Error("Appointment not found"), { statusCode: 404 });
    }
    if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
       throw Object.assign(new Error("This appointment is no longer active"), { statusCode: 400 });
    }

    // Auto-confirm PENDING appointments when a call is initiated
    if (appt.status === 'PENDING') {
        await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'CONFIRMED' } });
    }

    // Self-hosted WebRTC: room is identified by appointmentId.
    // The actual video call runs peer-to-peer via Socket.IO signaling on the backend.
    const roomIdentifier = `webrtc-room:${appointmentId}`;

    return prisma.teleconsultation.upsert({
        where: { appointmentId },
        update: { roomUrl: roomIdentifier, startedAt: new Date() },
        create: {
            appointmentId,
            roomUrl: roomIdentifier,
            startedAt: new Date()
        }
    });
};

const getRoomAccess = async (appointmentId) => {
    const session = await prisma.teleconsultation.findUnique({ 
        where: { appointmentId },
        include: { appointment: { include: { doctor: true, child: { include: { parent: true } } } } }
    });
    
    if (!session || session.endedAt) {
        throw Object.assign(new Error("Consultation room is invalid, not started yet, or already terminated."), { statusCode: 403 });
    }
    return session;
};

const endRoom = async (appointmentId, notes) => {
    return prisma.$transaction([
        prisma.teleconsultation.update({
            where: { appointmentId },
            data: { endedAt: new Date(), notes }
        }),
        prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' }
        })
    ]);
};

module.exports = { generateRoom, getRoomAccess, endRoom };
