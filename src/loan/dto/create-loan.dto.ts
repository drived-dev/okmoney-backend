import { createZodDto } from '@anatine/zod-nestjs';
import { LoanSchema } from '../entities/loan.entity';

export const CreateLoanSchema = LoanSchema.omit({
  id: true,
});

export class CreateLoanDto extends createZodDto(CreateLoanSchema) {}
