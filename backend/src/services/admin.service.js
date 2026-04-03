const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTelemetry = async () => {
    const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
    const totalDoctors = await prisma.user.count({ where: { role: 'DOCTOR', deletedAt: null } });
    const totalAppointments = await prisma.appointment.count();
    const activeTeleconsults = await prisma.teleconsultation.count({ where: { endedAt: null } });
    const totalChatbotSessions = await prisma.chatbotSession.count();

    const recentAudits = await prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, role: true } } }
    });

    return { totalUsers, totalDoctors, totalAppointments, activeTeleconsults, totalChatbotSessions, recentAudits };
};

const getUsers = async () => {
    return prisma.user.findMany({
        select: { id: true, email: true, role: true, isActive: true, isEmailVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    });
};

const toggleUserSuspension = async (userId, isSuspended) => {
    return prisma.user.update({
        where: { id: userId },
        data: { isActive: !isSuspended } // Strict boolean inversion
    });
};

const getAudits = async (limit = 100) => {
    return prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, role: true } } }
    });
};

module.exports = { getTelemetry, getUsers, toggleUserSuspension, getAudits };
