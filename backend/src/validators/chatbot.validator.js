const { z } = require('zod');

const messageSchema = z.object({
  message: z.string().min(1)
});

const templateSchema = z.object({
  triggerKeyword: z.string().trim().min(2).max(255),
  response: z.string().trim().min(20).max(5000),
  language: z.enum(['en', 'so']).default('en'),
  sourceUrl: z.string().trim().url().max(500).nullable().optional(),
  reviewerName: z.string().trim().min(2).max(120).nullable().optional(),
  isClinicallyReviewed: z.boolean().default(false)
});

module.exports = { messageSchema, templateSchema };
