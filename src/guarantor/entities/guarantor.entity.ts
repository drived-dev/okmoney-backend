import { z } from 'zod';

const e164PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

export const GuarantorSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      e164PhoneNumberRegex,
      'Phone number must be in E.164 format (+66819009000)',
    ),
});

export type Guarantor = z.infer<typeof GuarantorSchema>;
