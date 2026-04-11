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

const getChatbotTemplates = async () => {
    return prisma.chatbotTemplate.findMany({
        orderBy: { updatedAt: 'desc' }
    });
};

const upsertChatbotTemplate = async (triggerKeyword, response) => {
    const normalize = (value = '') => value.toLowerCase().replace(/[^\w\s,|]/g, ' ').replace(/\s+/g, ' ').trim();
    const normalizedParts = triggerKeyword
        .split(/[,\n|]/)
        .map((part) => normalize(part))
        .filter(Boolean);

    if (!normalizedParts.length) {
        throw Object.assign(new Error('Trigger keyword cannot be empty'), { statusCode: 400 });
    }

    const normalizedTriggerKeyword = normalizedParts.join(', ');
    return prisma.chatbotTemplate.upsert({
        where: { triggerKeyword: normalizedTriggerKeyword },
        update: { response },
        create: { triggerKeyword: normalizedTriggerKeyword, response }
    });
};

const deleteChatbotTemplate = async (templateId) => {
    return prisma.chatbotTemplate.delete({
        where: { id: templateId }
    });
};

module.exports = {
    getTelemetry,
    getUsers,
    toggleUserSuspension,
    getAudits,
    getChatbotTemplates,
    upsertChatbotTemplate,
    deleteChatbotTemplate
};
