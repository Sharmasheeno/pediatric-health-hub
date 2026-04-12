const { z } = require('zod');

const createFacilitySchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1),
  address: z.string(),
  phoneNumber: z.string()
});

const updateFacilitySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional()
});

module.exports = { updateFacilitySchema, createFacilitySchema };
