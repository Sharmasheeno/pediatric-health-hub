const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addGrowthRecord = async (data) => prisma.growthRecord.create({ data });

const getGrowthByChild = async (childId) => prisma.growthRecord.findMany({
  where: { childId, deletedAt: null },
  orderBy: { measurementDate: 'asc' }
});

module.exports = { addGrowthRecord, getGrowthByChild };
