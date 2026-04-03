const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createAllergy = async (data) => prisma.allergy.create({ data });
const createMedication = async (data) => prisma.medication.create({ data });
const createIllness = async (data) => prisma.illnessHistory.create({ data });

const getParentRecordsByChild = async (childId) => {
  return await prisma.child.findUnique({
    where: { id: childId, deletedAt: null },
    include: { allergies: true, medications: true, illnesses: true }
  });
};

const createConsultationNote = async (doctorId, data) => {
  return prisma.consultationNote.create({
    data: { ...data, doctorId }
  });
};

const getConsultationsByChild = async (childId) => {
  return prisma.consultationNote.findMany({
    where: { childId },
    include: { doctor: { select: { firstName: true, lastName: true, specialization: true } }, attachments: true },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = { createAllergy, createMedication, createIllness, getParentRecordsByChild, createConsultationNote, getConsultationsByChild };
