import { createZodDto } from '@anatine/zod-nestjs';
import { LoanSchema } from '../entities/loan.entity';

export const UpdateLoanSchema = LoanSchema.partial();
export class UpdateLoanDto extends createZodDto(UpdateLoanSchema) {}
