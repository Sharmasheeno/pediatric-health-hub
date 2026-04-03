const { z } = require('zod');

const createMedicalRecordSchema = z.object({
  childId: z.string().uuid(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  treatment: z.string().optional(),
  notes: z.string().optional()
});

module.exports = { createMedicalRecordSchema };
