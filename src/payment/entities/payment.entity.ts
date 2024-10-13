import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export enum PaymentType {
  EXISTING = 0,
  CASH = 1,
  TRANSFER = 2,
}

export const PaymentSchema = z.object({
  id: z.string(),
  loanId: z.string(),
  creditorId: z.string(),
  debtorId: z.string(),
  amount: z.number().min(0, 'Amount is required'),
  paymentDate: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
  paymentType: z.nativeEnum(PaymentType),
  imageUrl: z.string().optional(),
  createdAt: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
  updatedAt: z.coerce
    .date()
    .transform((date) => new Date(date).getTime())
    .optional(),
});

export class Payment extends createZodDto(PaymentSchema) {}
