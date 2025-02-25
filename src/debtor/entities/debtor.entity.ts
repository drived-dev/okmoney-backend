import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const e164PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

// TODO: Do debtors have address, profileImage?
export const DebtorSchema = z
  .object({
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    nickname: z.string().min(1, 'Nickname is required'),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .regex(
        e164PhoneNumberRegex,
        'Phone number must be in E.164 format (+66819009000)',
      ),
    memoNote: z.string().optional(),
    address: z.string().optional(),
    createdAt: z.coerce
      .date()
      .transform((date) => new Date(date).getTime())
      .optional(),
    updatedAt: z.coerce
      .date()
      .transform((date) => new Date(date).getTime())
      .optional(),
    autoSendSms: z.boolean().optional(),
    profileImage: z.string().optional(),
  })
  .strict();

export class Debtor extends createZodDto(DebtorSchema) {}
