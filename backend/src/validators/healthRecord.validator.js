const { z } = require('zod');

const createAllergySchema = z.object({
  childId: z.string().uuid(),
  allergen: z.string().min(1),
  severity: z.string(),
  notes: z.string().optional()
});

const createMedicationSchema = z.object({
  childId: z.string().uuid(),
  name: z.string().min(1),
  dosage: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional()
});

const createIllnessSchema = z.object({
  childId: z.string().uuid(),
  illnessName: z.string().min(1),
  diagnosisDate: z.string().datetime(),
  notes: z.string().optional()
});

const createConsultationSchema = z.object({
  childId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  notes: z.string().min(1),
  treatmentPlan: z.string().optional()
});

module.exports = { createAllergySchema, createMedicationSchema, createIllnessSchema, createConsultationSchema };
