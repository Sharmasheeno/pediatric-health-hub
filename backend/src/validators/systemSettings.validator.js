const { z } = require('zod');

const optionalText = (max) => z.string().trim().max(max).nullable().optional();

const settingsSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  shortName: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(255),
  logoDataUrl: z.string().max(1_400_000).nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  supportEmail: optionalText(191).refine(value => !value || z.email().safeParse(value).success, 'Enter a valid support email'),
  supportPhone: optionalText(40),
  websiteUrl: optionalText(255).refine(value => !value || z.url({ protocol: /^https?$/ }).safeParse(value).success, 'Enter a valid HTTP or HTTPS website URL'),
  address: optionalText(2000),
  country: z.string().trim().min(2).max(100),
  timezone: z.string().trim().min(3).max(80),
  currency: z.string().trim().regex(/^[A-Z]{3}$/),
  assistantName: z.string().trim().min(2).max(100),
  assistantDisclaimer: z.string().trim().min(20).max(2000)
});

const validateLogo = (logoDataUrl) => {
  if (logoDataUrl === null) return true;
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(logoDataUrl);
  if (!match) return false;
  return Buffer.from(match[2], 'base64').byteLength <= 1024 * 1024;
};

module.exports = { settingsSchema, validateLogo };
