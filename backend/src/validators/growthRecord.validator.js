const { z } = require('zod');

const createGrowthSchema = z.object({
  childId: z.string().uuid(),
  measurementDate: z.string().datetime(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  headCircumCm: z.number().positive().optional()
});

module.exports = { createGrowthSchema };
