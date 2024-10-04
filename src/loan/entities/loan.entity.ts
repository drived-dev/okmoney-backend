import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export enum LoanStatus {
  PENDING = 0,
  ACTIVE = 1,
  CLOSED = 2,
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
  remainingBalance: z.number().min(0, 'Remaining balance is required'),
  totalBalance: z.number().min(0, 'Total balance is required'),
  totalLoanTerm: z.number().int().min(1, 'Total loan term is required'),
  loanTermType: z.nativeEnum(LoanTermType),
  loanTermInterval: z.number().int().min(0, 'Loan term interval is required'),
  interestType: z.nativeEnum(InterestType),
  interestRate: z.number().min(0, 'Interest rate is required'),
  dueDate: z.coerce.date().transform((date) => new Date(date).getTime()),
  tags: z.string().array(),

  debtorId: z.string(),
  creditorId: z.string(),
  guarantorId: z.string().optional(),
});

export class Loan extends createZodDto(LoanSchema) {}
