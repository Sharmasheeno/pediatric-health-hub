const { Prisma, PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createAppointment = async (data) => {
  // Utilizing Serializable isolation to explicitly prevent race-conditions/double-bookings
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        scheduledAt: data.scheduledAt,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      }
    });

    if (existing) {
      throw Object.assign(new Error('This time slot is exclusively booked.'), { statusCode: 409 });
    }

    return await tx.appointment.create({ data });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
  });
};

const getAppointmentById = async (id) => {
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { child: true, doctor: true, teleconsultation: true }
  });
  if (!appt || appt.deletedAt) throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });
  return appt;
};

const updateAppointmentStatus = async (id, data) => {
  return prisma.appointment.update({
    where: { id },
    data
  });
};

const getDoctorAppointments = async (doctorId) => {
  return prisma.appointment.findMany({
     where: { doctorId, deletedAt: null },
     orderBy: { scheduledAt: 'asc' },
     include: { child: true, doctor: true }
  });
};

const getParentAppointments = async (parentId) => {
  return prisma.appointment.findMany({
    where: { child: { parentId }, deletedAt: null },
    orderBy: { scheduledAt: 'asc' },
    include: { child: true, doctor: true }
  });
};

const setAvailability = async (doctorId, data) => {
    return prisma.doctorAvailability.create({
        data: { ...data, doctorId }
    });
};

const getAvailableSlots = async (doctorId, date) => {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const config = await prisma.doctorAvailability.findMany({
        where: { doctorId, dayOfWeek, isActive: true }
    });
    return config; 
};

module.exports = { createAppointment, getAppointmentById, updateAppointmentStatus, getDoctorAppointments, getParentAppointments, setAvailability, getAvailableSlots };
