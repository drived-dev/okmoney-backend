import { z } from 'zod';

const e164PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

export const DebtorSchema = z.object({
  id: z.number().int().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  nickname: z.string().optional(),
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      e164PhoneNumberRegex,
      'Phone number must be in E.164 format (+66819009000)',
    ),
  memo_note: z.string().optional(),
  address: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  auto_send_sms: z.boolean().optional(),
  profile_image: z.string().optional(),
});

export type Debtor = z.infer<typeof DebtorSchema>;
