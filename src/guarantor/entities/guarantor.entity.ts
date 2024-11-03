import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const e164PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

export const GuarantorSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      e164PhoneNumberRegex,
      'Phone number must be in E.164 format (+66819009000)',
    ),
  createdAt: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
  updatedAt: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
});

export class Guarantor extends createZodDto(GuarantorSchema) {}
