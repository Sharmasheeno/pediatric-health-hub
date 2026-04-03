const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const runVaccineChecks = async () => {
    console.log("[CRON ENGINE] Executing daily vaccination status cascades...");
    const now = new Date();
    
    try {
        // Automatically cascade UPCOMING and DUE shots explicitly to MISSED
        const missedSweep = await prisma.vaccination.updateMany({
            where: { 
                status: { in: ['UPCOMING', 'DUE'] }, 
                scheduledDate: { lt: now } 
            },
            data: { status: 'MISSED' }
        });
        
        console.log(`[CRON ENGINE] Statuses stabilized. Migrated ${missedSweep.count} overdue instantiations to MISSED status.`);

        // Here we could query scheduledDate matching precisely in 7 days
        // And emit Notifications inside prisma.notification.createMany()
        
    } catch(err) {
        console.error("[CRON ENGINE] Execution halt failure:", err);
    }
};

const startCron = () => {
    // Basic event loop abstraction for Node, 24 hr cadence
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    setInterval(runVaccineChecks, ONE_DAY_MS);
    console.log("[CRON ENGINE] Vaccine chronological evaluation engine implicitly engaged.");
};

module.exports = { startCron, runVaccineChecks };
