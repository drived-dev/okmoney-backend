import { z } from 'zod';
import { RolePackage } from './rolePackage.entity';

const e164PhoneNumber = /^\+[1-9]\d{1,14}$/;

// TODO: Change optional based on data sent from FRONTEND
// TODO: Define API Schema for Creditor
export const CreditorSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  store_name: z.string().min(1, 'Store name is required'),
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      e164PhoneNumber,
      'Phone number must be in E.164 format (+66819009000)',
    ),
  role_package: z.nativeEnum(RolePackage),
  email: z
    .string()
    .email('Invalid email format')
    .transform((str) => str.toLowerCase())
    .optional(),
  created_at: z.number().int().optional(),
  updated_at: z.number().int().optional(),
  last_login: z.number().int().optional(),
  sms_available: z.number().int().optional(),
  debtor_slot_available: z.number().int().optional(),
  social_provider: z.number().int().optional(),
  profile_image: z.string().optional(),
});

export type Creditor = z.infer<typeof CreditorSchema>;
