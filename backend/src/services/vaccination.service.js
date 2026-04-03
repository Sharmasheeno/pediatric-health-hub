const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTemplate = async (data) => prisma.vaccineTemplate.create({ data });
const getTemplates = async () => prisma.vaccineTemplate.findMany({ orderBy: { daysAfterBirth: 'asc' } });

const generateScheduleForChild = async (childId) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw Object.assign(new Error('Patient boundaries not located'), { statusCode: 404 });

  const templates = await prisma.vaccineTemplate.findMany();
  const existing = await prisma.vaccination.findMany({ where: { childId } });

  const existingMap = new Set(existing.map(v => `${v.vaccineName}-${v.doseNumber}`));

  const newVaccines = [];
  for (const t of templates) {
    if (!existingMap.has(`${t.vaccineName}-${t.doseNumber}`)) {
       // Extrapolate timestamp structurally based on age
       const scheduledDate = new Date(child.dateOfBirth.getTime() + t.daysAfterBirth * 24 * 60 * 60 * 1000);
       let status = 'UPCOMING';
       if(scheduledDate < new Date()) status = 'MISSED'; 
       
       newVaccines.push({
           childId,
           vaccineName: t.vaccineName,
           doseNumber: t.doseNumber,
           scheduledDate,
           status
       });
    }
  }

  // Atomically flush missing records
  if (newVaccines.length > 0) {
      await prisma.vaccination.createMany({ data: newVaccines });
  }

  return await prisma.vaccination.findMany({ where: { childId }, orderBy: { scheduledDate: 'asc' } });
};

const getScheduleByChild = async (childId) => {
   return prisma.vaccination.findMany({ where: { childId }, orderBy: { scheduledDate: 'asc' } });
};

const updateVaccination = async (id, data) => {
   // Validate if marking as completed, an administeredDate should probably be tied automatically
   if (data.status === 'COMPLETED' && !data.administeredDate) {
       data.administeredDate = new Date();
   }
   return prisma.vaccination.update({ where: { id }, data });
};

module.exports = { createTemplate, getTemplates, generateScheduleForChild, getScheduleByChild, updateVaccination };
