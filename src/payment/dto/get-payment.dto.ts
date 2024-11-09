import { createZodDto } from '@anatine/zod-nestjs';
import { PaymentSchema } from '@/payment/entities/payment.entity';
import { z } from 'zod';

export const GetPaymentSchema = PaymentSchema.extend({
  debtorNickname: z.string(),
});

export class GetPaymentDto extends createZodDto(GetPaymentSchema) {}
