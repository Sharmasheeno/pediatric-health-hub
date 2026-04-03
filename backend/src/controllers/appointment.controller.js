const appointmentService = require('../services/appointment.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const createAppointment = async (req, res, next) => {
  try {
    const appt = await appointmentService.createAppointment(req.body);
    await logAction(req.user.id, 'CREATE_APPT', 'Appointment', appt.id, null, req);
    return successResponse(res, appt, 'Appointment booked successfully', 201);
  } catch (error) { next(error); }
};

const getAppointment = async (req, res, next) => {
  try {
    const appt = await appointmentService.getAppointmentById(req.params.id);
    return successResponse(res, appt, 'Appointment retrieved');
  } catch (error) { next(error); }
};

const updateStatus = async (req, res, next) => {
  try {
    const appt = await appointmentService.updateAppointmentStatus(req.params.id, req.body);
    await logAction(req.user.id, 'UPDATE_APPT_STATUS', 'Appointment', appt.id, { status: req.body.status }, req);
    return successResponse(res, appt, 'Appointment status updated');
  } catch (error) { next(error); }
};

const createAvailability = async (req, res, next) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const doc = await prisma.doctorProfile.findUnique({ where: { userId: req.user.id } });
        
        // Either the caller is the doc mapping their own constraints, or an ADMIN setting it. Fallback is robust.
        const doctorId = req.body.overrideDoctorId && req.user.role === 'ADMIN' ? req.body.overrideDoctorId : doc.id;
        if(!doctorId) throw Object.assign(new Error('Provider context undetermined'), { statusCode: 403 });

        const avail = await appointmentService.setAvailability(doctorId, req.body);
        return successResponse(res, avail, "Availability configured");
    } catch(error) { next(error); }
}

const getAvailabilityConfig = async (req, res, next) => {
    try {
        const slots = await appointmentService.getAvailableSlots(req.params.doctorId, req.query.date);
        return successResponse(res, slots, "Available parameters dynamically returned");
    } catch(error) { next(error); }
}

const getMySchedule = async (req, res, next) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        let appointments = [];
        if (req.user.role === 'DOCTOR') {
            const doc = await prisma.doctorProfile.findUnique({ where: { userId: req.user.id } });
            if(doc) {
                appointments = await appointmentService.getDoctorAppointments(doc.id);
            }
        } else if (req.user.role === 'PARENT') {
            const parent = await prisma.parentProfile.findUnique({ where: { userId: req.user.id } });
            if(parent) {
                appointments = await appointmentService.getParentAppointments(parent.id);
            }
        }
        
        return successResponse(res, { appointments }, "Schedule retrieved");
    } catch(error) { next(error); }
}

module.exports = { createAppointment, getAppointment, updateStatus, createAvailability, getAvailabilityConfig, getMySchedule };
