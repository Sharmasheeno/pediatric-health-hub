const { z } = require('zod');

const addGrowthRecordSchema = z.object({
  childId: z.string().uuid(),
  measurementDate: z.string().datetime(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  headCircumCm: z.number().positive().optional(),
  milestoneNotes: z.string().optional()
}).refine(data => data.weightKg || data.heightCm || data.headCircumCm || data.milestoneNotes, {
  message: "At least one metric or milestone string must be provided."
});

module.exports = { addGrowthRecordSchema };
