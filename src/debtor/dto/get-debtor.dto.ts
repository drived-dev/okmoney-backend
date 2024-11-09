import { LoanSchema } from '@/loan/entities/loan.entity';
import { z } from 'zod';
import { DebtorSchema } from '../entities/debtor.entity';
import { createZodDto } from '@anatine/zod-nestjs';

const GetDebtorSchema = z.object({
  loan: LoanSchema,
  debtor: DebtorSchema.optional(),
});

export class GetDebtorDto extends createZodDto(GetDebtorSchema) {}
