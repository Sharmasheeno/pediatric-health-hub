const { z } = require('zod');

const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.enum(['APPOINTMENT', 'VACCINE', 'SYSTEM'])
});

module.exports = { createNotificationSchema };
