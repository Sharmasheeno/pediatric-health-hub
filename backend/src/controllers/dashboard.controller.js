const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { successResponse } = require('../utils/responseWrapper');

const getTelemetry = async (req, res, next) => {
    try {
        const role = req.user.role;
        let stats = {};

        // Base random data for chart visual continuity until timeseries logging is generated in Phase 2
        const standardChart = [
            { name: 'Jan', uv: 200, sales: 400, orders: 200 },
            { name: 'Feb', uv: 300, sales: 300, orders: 400 },
            { name: 'Mar', uv: 100, sales: 500, orders: 300 },
            { name: 'Apr', uv: 250, sales: 200, orders: 500 },
            { name: 'May', uv: 150, sales: 350, orders: 150 },
            { name: 'Jun', uv: 400, sales: 450, orders: 400 },
            { name: 'Jul', uv: 350, sales: 550, orders: 350 }
        ];

        if (role === 'PARENT') {
            // Aggregate Parent relational metrics
            const childrenCount = await prisma.child.count({ where: { parentId: req.user.profile.id } });
            const apptCount = await prisma.appointment.count({ where: { parentId: req.user.profile.id } });
            
            stats = {
                title1: "My Registered Children", count1: childrenCount,
                title2: "Total Appointments", count2: apptCount,
                title3: "Teleconsultations", count3: 0,
                charts: standardChart
            };
        } else if (role === 'DOCTOR') {
            // Aggregate Doctor relational metrics
            const apptCount = await prisma.appointment.count({ where: { doctorId: req.user.profile.id } });
            const recordCount = await prisma.consultationNote.count({ where: { doctorId: req.user.profile.id } });

            stats = {
                title1: "Assigned Patients", count1: apptCount,
                title2: "Completed Consultations", count2: recordCount,
                title3: "Pending Tasks", count3: 2,
                charts: standardChart
            };
        } else {
            // Aggregate System Admin Global metrics
            const parentCount = await prisma.user.count({ where: { role: 'PARENT' } });
            const docCount = await prisma.user.count({ where: { role: 'DOCTOR' } });
            const globalAppts = await prisma.appointment.count();

            stats = {
                title1: "Active Platform Users", count1: parentCount + docCount,
                title2: "Total Consultations", count2: globalAppts,
                title3: "System Alerts", count3: 0,
                charts: standardChart
            };
        }

        return successResponse(res, stats, "Telemetry aggregated successfully");
    } catch(err) {
        next(err);
    }
};

module.exports = { getTelemetry };
