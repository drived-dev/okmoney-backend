import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const GetDebtor = z.object({
  totalDebtors: z.number().int(),
  clearedDebtors: z.number().int(),
  currentDebtors: z.number().int(),
});

export class GetDebtorDto extends createZodDto(GetDebtor) {}

// TODO: waiting for Mel to confirm
const GetLoan = z.object({
  totalLoan: z.number(),
});

export class GetLoanDto extends createZodDto(GetLoan) {}

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
