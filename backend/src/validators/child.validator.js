const { z } = require('zod');

const isUnderEighteen = (value) => {
  const dateOfBirth = new Date(value);
  if (Number.isNaN(dateOfBirth.getTime())) return false;

  const today = new Date();
  const birthYear = dateOfBirth.getUTCFullYear();
  const birthMonth = dateOfBirth.getUTCMonth();
  const birthDay = dateOfBirth.getUTCDate();
  let age = today.getUTCFullYear() - birthYear;

  if (
    today.getUTCMonth() < birthMonth ||
    (today.getUTCMonth() === birthMonth && today.getUTCDate() < birthDay)
  ) {
    age -= 1;
  }

  return age >= 0 && age < 18;
};

const createChildSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  dateOfBirth: z.string().datetime().refine(isUnderEighteen, {
    message: 'Child must be under 18 years old and the date of birth cannot be in the future.'
  }),
  gender: z.string(),
  bloodType: z.string().optional()
});

const updateChildSchema = createChildSchema.partial();

module.exports = { createChildSchema, updateChildSchema };
