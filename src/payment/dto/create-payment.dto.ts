import { createZodDto } from '@anatine/zod-nestjs';
import { PaymentSchema } from '../entities/payment.entity';
import { z } from 'zod';
import { LoanSchema } from '../../loan/entities/loan.entity';

export const CreatePaymentSchema = PaymentSchema.omit({ id: true });

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}

export const CreatePaymentResponseSchema = z.object({
  payment: PaymentSchema,
  loan: LoanSchema,
});

export class CreatePaymentResponseDto extends createZodDto(
  CreatePaymentResponseSchema,
) {}
