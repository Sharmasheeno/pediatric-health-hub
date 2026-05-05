const { z } = require('zod');

const strongPasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (!@#$%^&*)");

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: strongPasswordSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['PARENT', 'DOCTOR', 'FACILITY', 'ADMIN'], {
    errorMap: () => ({ message: "Invalid role specified" })
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format")
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token required"),
  newPassword: strongPasswordSchema
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token required")
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required")
});

module.exports = {
  strongPasswordSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema
};
