const { z } = require('zod');

const createAppointmentSchema = z.object({
  childId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  reason: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
  notes: z.string().optional()
});

const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM format")
});

module.exports = { createAppointmentSchema, updateStatusSchema, availabilitySchema };
