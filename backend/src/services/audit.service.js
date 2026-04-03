const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAction = async (userId, action, entity, entityId, details, req) => {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress
      }
    });
  } catch (error) {
    console.error('Audit Log Failed:', error);
  }
};

module.exports = { logAction };
