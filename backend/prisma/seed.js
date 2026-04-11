const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initiating Pediatric Health Hub Database Seeder...");

  const saltRound = 10;
  const defaultChatbotTemplates = [
    {
      triggerKeyword: 'fever, high temperature, child fever',
      response: 'For pediatric fever, keep your child hydrated, monitor temperature, and avoid over-layering clothes. If fever is above 102 F for long periods or your child is under 3 months, seek urgent clinical advice.'
    },
    {
      triggerKeyword: 'cough, persistent cough, dry cough',
      response: 'A mild cough may improve with hydration and rest. Watch for breathing difficulty, chest retractions, wheezing, or persistent high fever. If any of those appear, book an appointment immediately.'
    },
    {
      triggerKeyword: 'vomit, vomiting, throw up',
      response: 'After vomiting, offer small frequent sips of oral fluids to prevent dehydration. Seek care promptly if vomiting is persistent, there is no urine output, blood appears, or the child becomes unusually sleepy.'
    },
    {
      triggerKeyword: 'diarrhea, loose stool, stomach bug',
      response: 'For diarrhea, prioritize oral rehydration and monitor urine output. Contact a doctor if symptoms persist beyond 24-48 hours, blood appears in stool, or signs of dehydration develop.'
    },
    {
      triggerKeyword: 'rash, skin rash, red spots',
      response: 'Rashes in children can have many causes. Avoid new skin products and monitor fever, swelling, or breathing changes. If rash spreads quickly or your child seems unwell, seek same-day medical evaluation.'
    },
    {
      triggerKeyword: 'vaccine, vaccination, immunization',
      response: 'Vaccinations are best tracked by schedule and age milestones. You can use the vaccine tracker in this app and book a doctor appointment if your child is due or has missed a dose.'
    }
  ];
  
  // 1. Create Default ROOT Admin
  const adminPassword = await bcrypt.hash('admin123', saltRound);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pediatric-hub.com' },
    update: {},
    create: {
      email: 'admin@pediatric-hub.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true
    },
  });
  console.log(`✅ Default Admin Created: ${adminUser.email} / admin123`);

  // 2. Create Default DOCTOR Profile
  const docPassword = await bcrypt.hash('doctor123', saltRound);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@pediatric-hub.com' },
    update: {},
    create: {
      email: 'doctor@pediatric-hub.com',
      password: docPassword,
      role: 'DOCTOR',
      isActive: true,
      isEmailVerified: true,
      doctorProfile: {
        create: {
            firstName: 'Sarah',
            lastName: 'Jenkins',
            specialization: 'Pediatric Pulmonology',
            licenseNumber: 'MD-123456789'
        }
      }
    },
  });
  console.log(`✅ Default Doctor Created: ${doctorUser.email} / doctor123`);

  // 3. Create Default PARENT Profile
  const parentPassword = await bcrypt.hash('parent123', saltRound);
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@pediatric-hub.com' },
    update: {},
    create: {
      email: 'parent@pediatric-hub.com',
      password: parentPassword,
      role: 'PARENT',
      isActive: true,
      isEmailVerified: true,
      parentProfile: {
          create: {
              firstName: 'John',
              lastName: 'Doe',
              phoneNumber: '+1-555-010-0000'
          }
      }
    },
  });
  console.log(`✅ Default Parent Created: ${parentUser.email} / parent123`);

  // 4. Create Baseline Chatbot Trigger Templates
  for (const tpl of defaultChatbotTemplates) {
    await prisma.chatbotTemplate.upsert({
      where: { triggerKeyword: tpl.triggerKeyword },
      update: { response: tpl.response },
      create: {
        triggerKeyword: tpl.triggerKeyword,
        response: tpl.response
      }
    });
  }
  console.log(`✅ Default Chatbot Templates Upserted: ${defaultChatbotTemplates.length}`);

}

main()
  .then(async () => {
    console.log("🏁 Seeding complete.");
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Schema Seeding Failure:", e);
    await prisma.$disconnect()
    process.exit(1)
  })
