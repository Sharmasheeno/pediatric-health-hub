const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  newPassword: z.string().min(8, "Password must be at least 8 characters")
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token required")
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required")
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema
};
