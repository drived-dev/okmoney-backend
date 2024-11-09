import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const GetDashboardDebtor = z.object({
  totalDebtors: z.number().int(),
  clearedDebtors: z.number().int(),
  currentDebtors: z.number().int(),
});

export class GetDashboardDebtorDto extends createZodDto(GetDashboardDebtor) {}

// TODO: waiting for Mel to confirm
const GetDashboardLoan = z.object({
  totalLoan: z.number(),
  accuredIncome: z.number(),
  totalEarned: z.number(),
  profit: z.number(),
});

export class GetDashboardLoanDto extends createZodDto(GetDashboardLoan) {}

export enum LoanByTimeInterval {
  'Year',
  'Month',
}

const GetLoanByTime = z.object({
  totalPrincipal: z.number(),
  totalEarned: z.number(),
  data: z.array(
    z.object({
      time: z.coerce.date(),
      principal: z.number(),
      earned: z.number(),
    }),
  ),
  interval: z.nativeEnum(LoanByTimeInterval),
});

export class GetLoanByTimeDto extends createZodDto(GetLoanByTime) {}
