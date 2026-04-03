const { z } = require('zod');

const createContentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string()
});

module.exports = { createContentSchema };
