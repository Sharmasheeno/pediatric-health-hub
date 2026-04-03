const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRecord = async (data) => {
  return prisma.medicalRecord.create({ data });
};

const getRecordsByChild = async (childId) => {
  return prisma.medicalRecord.findMany({
    where: { childId, deletedAt: null },
    orderBy: { recordedAt: 'desc' }
  });
};

module.exports = { createRecord, getRecordsByChild };
