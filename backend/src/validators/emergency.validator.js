const { z } = require('zod');

const createContactSchema = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().min(1),
  type: z.string(),
  region: z.string().optional()
});

module.exports = { createContactSchema };
