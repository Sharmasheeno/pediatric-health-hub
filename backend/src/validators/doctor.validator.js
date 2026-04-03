const { z } = require('zod');

const updateDoctorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  facilityId: z.string().optional()
});

module.exports = { updateDoctorSchema };
