const { z } = require('zod');

const updateFacilitySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional()
});

module.exports = { updateFacilitySchema };
