import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export enum LoanStatus {
  OVERDUE = 'OVERDUE', // ค้างชำระ
  UNDERDUE = 'UNDERDUE', // ใกล้กำหนดชำระ
  DUE = 'DUE', // รอชำระ
  CLOSED = 'CLOSED',
}

export enum InterestType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

export enum LoanTermType {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

export const LoanSchema = z
  .object({
    id: z.string(),
    loanNumber: z.string().optional(),
    principal: z.number().min(0, 'Principal is required'),
    loanStatus: z.nativeEnum(LoanStatus).optional(),
    remainingBalance: z.number(),
    dueFromPreviousTerm: z.number().optional(),
    totalBalance: z.number().min(0, 'Total balance is required'),
    totalLoanTerm: z.number().int(),
    loanTermType: z.nativeEnum(LoanTermType),
    loanTermInterval: z.number().int(),
    interestType: z.nativeEnum(InterestType),
    interestRate: z.number(),
    dueDate: z.coerce.date().transform((date) => new Date(date).getTime()),
    tags: z.string().array(),

    debtorId: z.string(),
    creditorId: z.string(),
    guarantorId: z.string().optional(),

    createdAt: z.coerce
      .date()
      .transform((date) => new Date(date).getTime())
      .optional(),
    updatedAt: z.coerce
      .date()
      .transform((date) => new Date(date).getTime())
      .optional(),
  })
  .strict();

export class Loan extends createZodDto(LoanSchema) {}
