const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateRoom = async (appointmentId) => {
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt || appt.status !== 'CONFIRMED') {
       throw Object.assign(new Error("Appointment not confirmed or missing entirely"), { statusCode: 400 });
    }

    // Proxy Daily.co WebRTC instantiation securely server-side.
    // In production, execute: fetch('https://api.daily.co/v1/rooms', { method: 'POST' }) protecting the bearer token.
    const generatedUrl = `https://pediatric-health.daily.co/room-${appointmentId.substring(0,8)}-secure`;

    return prisma.teleconsultation.upsert({
        where: { appointmentId },
        update: { roomUrl: generatedUrl },
        create: {
            appointmentId,
            roomUrl: generatedUrl,
            startedAt: new Date()
        }
    });
};

const getRoomAccess = async (appointmentId) => {
    const session = await prisma.teleconsultation.findUnique({ 
        where: { appointmentId },
        include: { appointment: true }
    });
    
    if (!session || session.endedAt) throw Object.assign(new Error("Consultation room invalid or already terminated permanently"), { statusCode: 403 });
    return session;
};

const endRoom = async (appointmentId, notes) => {
    return prisma.teleconsultation.update({
        where: { appointmentId },
        data: { endedAt: new Date(), notes }
    });
};

module.exports = { generateRoom, getRoomAccess, endRoom };
