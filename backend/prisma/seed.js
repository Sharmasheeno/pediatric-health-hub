const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initiating Pediatric Health Hub Database Seeder...");

  const saltRound = 10;
  
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
