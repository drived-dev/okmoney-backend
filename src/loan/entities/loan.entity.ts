import { z } from 'zod';

export const LoanSchema = z.object({
  id: z.number().int().optional(),
  loanNumber: z.string().optional(),
  principal: z.number().min(0, 'Principal is required'),
  loanStatus: z.number().int().min(0, 'Loan status is required'),
  remainingBalance: z.number().min(0, 'Remaining balance is required'),
  totalBalance: z.number().min(0, 'Total balance is required'),
  totalLoanTerm: z.number().int().min(1, 'Total loan term is required'),
  loanTermType: z.number().int().min(0, 'Loan term type is required'),
  loanTermInterval: z.number().int().min(0, 'Loan term interval is required'),
  interestType: z.number().int().min(0, 'Interest type is required'),
  interestRate: z.number().min(0, 'Interest rate is required'),
  dueDate: z.date().optional(),
  tags: z.string().optional(),

  debtorId: z.string().optional(),
  creditorId: z.string().optional(),
  guarantorId: z.string().optional(),
});

export type Loan = z.infer<typeof LoanSchema>;
