import { z } from 'zod';

const e164PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

export const DebtorSchema = z.object({
  id: z.number().int().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  nickname: z.string().optional(),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      e164PhoneNumberRegex,
      'Phone number must be in E.164 format (+66819009000)',
    ),
  memoNote: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  autoSendSms: z.boolean().optional(),
  profileImage: z.string().optional(),
});

export type Debtor = z.infer<typeof DebtorSchema>;
