import { createZodDto } from '@anatine/zod-nestjs';
import { PaymentSchema } from '../entities/payment.entity';

export const UpdatePaymentSchema = PaymentSchema.partial();
export class UpdatePaymentDto extends createZodDto(UpdatePaymentSchema) {}
