import { createZodDto } from '@anatine/zod-nestjs';
import { DebtorSchema } from '../entities/debtor.entity';

export const UpdateDebtorSchema = DebtorSchema.partial();
export class UpdateDebtorDto extends createZodDto(UpdateDebtorSchema) {}
