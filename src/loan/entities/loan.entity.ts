import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export enum LoanStatus {
  OVERDUE = 0, // ค้างชำระ
  UNDERDUE = 1, // ใกล้กำหนดชำระ
  DUE = 2, // รอชำระ
  CLOSED = 3,
}

export enum InterestType {
  FIXED = 0,
  VARIABLE = 1,
}

export enum LoanTermType {
  MONTHLY = 0,
  WEEKLY = 1,
  DAILY = 2,
}

export const LoanSchema = z.object({
  id: z.string(),
  loanNumber: z.string().optional(),
  principal: z.number().min(0, 'Principal is required'),
  loanStatus: z.nativeEnum(LoanStatus),
  remainingBalance: z.number(),
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
});

export class Loan extends createZodDto(LoanSchema) {}
