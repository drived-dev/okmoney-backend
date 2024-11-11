import { z } from 'zod';
import { RolePackage } from './rolePackage.entity';
import { createZodDto } from '@anatine/zod-nestjs';

const e164PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

export const CreditorSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  storeName: z.string().min(1, 'Store name is required'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      e164PhoneNumberRegex,
      'Phone number must be in E.164 format (+66819009000)',
    ),
  rolePackage: z.nativeEnum(RolePackage),
  tags: z.string().array(),
  email: z
    .string()
    .email('Invalid email format')
    .transform((str) => str.toLowerCase())
    .optional(),
  createdAt: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
  updatedAt: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
  lastLogin: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
  smsAvailable: z.number().int().optional(),
  debtorSlotAvailable: z.number().int().optional(),
  socialProvider: z.number().int().optional(),
  profileImage: z.string().optional(),

  googleId: z.string().optional(),
  facebookId: z.string().optional(),
  lineId: z.string().optional(),
  password: z.string().optional(),
});

export class Creditor extends createZodDto(CreditorSchema) {}
