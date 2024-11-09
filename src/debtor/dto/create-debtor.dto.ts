import { PaymentSchema } from '@/payment/entities/payment.entity';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { LoanSchema } from '../../loan/entities/loan.entity';
import { DebtorSchema } from '../entities/debtor.entity';

export const CreateDebtorSchema = DebtorSchema.omit({ id: true });

export class CreateDebtorDto extends createZodDto(CreateDebtorSchema) {}

export const CreateNewDebtorSchema = z.object({
  debtor: CreateDebtorSchema,
  loan: LoanSchema.omit({
    id: true,
    debtorId: true,
    creditorId: true,
  }),
});

export class CreateNewDebtorDto extends createZodDto(CreateNewDebtorSchema) {}

export const CreateExistingDebtorSchema = CreateNewDebtorSchema.extend({
  paidAmount: z
    .number()
    .min(0, 'Paid amount must be greater than or equal to 0')
    .optional(),
});

export class CreateExistingDebtorDto extends createZodDto(
  CreateExistingDebtorSchema,
) {}

export const BulkCreateDebtorSchema = z.object({
  debtors: CreateExistingDebtorSchema.array(),
});

export class BulkCreateDebtorDto extends createZodDto(BulkCreateDebtorSchema) {}

const CreatedResponseSchema = z.object({
  debtor: DebtorSchema,
  loan: LoanSchema,
  payment: PaymentSchema.optional(),
});

export class CreatedResponseDto extends createZodDto(CreatedResponseSchema) {}
