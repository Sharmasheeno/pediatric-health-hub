const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function patch() {
    console.log("Starting patch...");
    
    // Find all doctors that are deleted
    const deletedDoctors = await prisma.doctorProfile.findMany({
        where: { deletedAt: { not: null } }
    });
    
    console.log(`Found ${deletedDoctors.length} deleted doctors.`);
    
    for (const doc of deletedDoctors) {
        const res = await prisma.appointment.updateMany({
            where: {
                doctorId: doc.id,
                status: { in: ['PENDING', 'CONFIRMED'] }
            },
            data: { status: 'CANCELLED' }
        });
        console.log(`Cancelled ${res.count} stuck appointments for Dr. ${doc.lastName}`);
    }
    
    console.log("Patch complete.");
}

patch().catch(console.error).finally(() => prisma.$disconnect());
