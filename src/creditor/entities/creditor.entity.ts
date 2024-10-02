import { z } from 'zod';
import { RolePackage } from './rolePackage.entity';

const e164PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

export const CreditorSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  storeName: z.string().min(1, 'Store name is required'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      e164PhoneNumberRegex,
      'Phone number must be in E.164 format (+66819009000)',
    ),
  rolePackage: z.nativeEnum(RolePackage),
  email: z
    .string()
    .email('Invalid email format')
    .transform((str) => str.toLowerCase())
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastLogin: z.date().optional(),
  smsAvailable: z.number().int().optional(),
  debtorSlotAvailable: z.number().int().optional(),
  socialProvider: z.number().int().optional(),
  profileImage: z.string().optional(),
});

export type Creditor = z.infer<typeof CreditorSchema>;
