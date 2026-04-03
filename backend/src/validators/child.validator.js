const { z } = require('zod');

const createChildSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  dateOfBirth: z.string().datetime(),
  gender: z.string(),
  bloodType: z.string().optional()
});

const updateChildSchema = createChildSchema.partial();

module.exports = { createChildSchema, updateChildSchema };
