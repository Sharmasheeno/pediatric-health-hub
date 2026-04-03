const { z } = require('zod');

const createRoomSchema = z.object({
  appointmentId: z.string().uuid()
});

const endRoomSchema = z.object({
  notes: z.string().optional()
});

module.exports = { createRoomSchema, endRoomSchema };
