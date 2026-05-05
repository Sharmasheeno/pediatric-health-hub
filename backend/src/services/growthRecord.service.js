const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addGrowthRecord = async (data) => prisma.growthRecord.create({ data });

const getGrowthByChild = async (childId) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw new Error("Child not found");

  const records = await prisma.growthRecord.findMany({
    where: { childId, deletedAt: null },
    orderBy: { measurementDate: 'asc' }
  });

  const chartData = records.map(r => {
    const ageInMs = new Date(r.measurementDate).getTime() - new Date(child.dateOfBirth).getTime();
    const ageInMonths = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 30.44));
    return {
      ageInMonths,
      weight: r.weightKg,
      height: r.heightCm
    };
  });

  return { records, chartData };
};

module.exports = { addGrowthRecord, getGrowthByChild };
