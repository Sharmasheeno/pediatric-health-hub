const { z } = require('zod');

const createDoctorSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  licenseNumber: z.string(),
  specialization: z.string(),
  facilityId: z.string().optional()
});

const updateDoctorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  facilityId: z.string().optional()
});

module.exports = { createDoctorSchema, updateDoctorSchema };
