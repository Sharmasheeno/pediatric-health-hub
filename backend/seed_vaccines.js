const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEMPLATES = [
  { vaccineName: 'Hepatitis B', doseNumber: 1, daysAfterBirth: 0, description: 'First dose given at birth', isMandatory: true },
  { vaccineName: 'Hepatitis B', doseNumber: 2, daysAfterBirth: 30, description: 'Second dose at 1 month', isMandatory: true },
  { vaccineName: 'Hepatitis B', doseNumber: 3, daysAfterBirth: 180, description: 'Third dose at 6 months', isMandatory: true },
  { vaccineName: 'DTaP', doseNumber: 1, daysAfterBirth: 60, description: 'Diphtheria, tetanus, and whooping cough - Dose 1', isMandatory: true },
  { vaccineName: 'DTaP', doseNumber: 2, daysAfterBirth: 120, description: 'Diphtheria, tetanus, and whooping cough - Dose 2', isMandatory: true },
  { vaccineName: 'DTaP', doseNumber: 3, daysAfterBirth: 180, description: 'Diphtheria, tetanus, and whooping cough - Dose 3', isMandatory: true },
  { vaccineName: 'Polio (IPV)', doseNumber: 1, daysAfterBirth: 60, description: 'Polio vaccine - Dose 1', isMandatory: true },
  { vaccineName: 'Polio (IPV)', doseNumber: 2, daysAfterBirth: 120, description: 'Polio vaccine - Dose 2', isMandatory: true },
  { vaccineName: 'MMR', doseNumber: 1, daysAfterBirth: 365, description: 'Measles, mumps, rubella - Dose 1', isMandatory: true },
  { vaccineName: 'Varicella (Chickenpox)', doseNumber: 1, daysAfterBirth: 365, description: 'Chickenpox vaccine - Dose 1', isMandatory: true }
];

async function seed() {
  console.log("Starting vaccine template seeding...");
  
  for (const t of TEMPLATES) {
    const existing = await prisma.vaccineTemplate.findFirst({
        where: { vaccineName: t.vaccineName, doseNumber: t.doseNumber }
    });
    
    if (!existing) {
        await prisma.vaccineTemplate.create({ data: t });
        console.log(`Created template: ${t.vaccineName} Dose ${t.doseNumber}`);
    } else {
        console.log(`Template already exists: ${t.vaccineName} Dose ${t.doseNumber}`);
    }
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
