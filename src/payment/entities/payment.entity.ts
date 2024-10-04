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
  amount: z.number().min(0, 'Amount is required'),
  paymentDate: z.coerce.date().optional(),
  paymentType: z.nativeEnum(PaymentType),
  imageUrl: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export class Payment extends createZodDto(PaymentSchema) {}
