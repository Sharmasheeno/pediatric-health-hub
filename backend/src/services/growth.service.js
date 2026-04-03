const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addRecord = async (doctorIdOrParentId, role, data) => {
    return prisma.growthRecord.create({
        data: {
            ...data,
            recordedById: doctorIdOrParentId,
            recorderRole: role
        }
    });
};

const getRecordsByChild = async (childId) => {
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw Object.assign(new Error("Patient context completely missing"), { statusCode: 404 });

    const records = await prisma.growthRecord.findMany({
        where: { childId, deletedAt: null },
        orderBy: { measurementDate: 'asc' },
        include: { author: { select: { email: true, role: true } } }
    });

    // Translate explicitly into chart payloads
    const chartData = records.filter(r => r.weightKg || r.heightCm).map(r => {
        // Calculate precise age based on exact diffs
        const diffTime = Math.abs(new Date(r.measurementDate) - new Date(child.dateOfBirth));
        const ageInMonths = Number((diffTime / (1000 * 60 * 60 * 24 * 30.44)).toFixed(1));
        return {
            ageInMonths,
            weight: r.weightKg,
            height: r.heightCm,
            headCircum: r.headCircumCm,
            authorRole: r.recorderRole,
            date: r.measurementDate
        };
    });

    return { records, chartData };
};

module.exports = { addRecord, getRecordsByChild };
