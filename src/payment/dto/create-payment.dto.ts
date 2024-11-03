import { createZodDto } from '@anatine/zod-nestjs';
import { PaymentSchema } from '../entities/payment.entity';

export const CreatePaymentSchema = PaymentSchema.omit({ id: true });

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}
