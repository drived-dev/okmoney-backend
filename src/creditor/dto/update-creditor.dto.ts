import { createZodDto } from '@anatine/zod-nestjs';
import { CreditorSchema } from '../entities/creditor.entity';

export const UpdateCreditorSchema = CreditorSchema.partial();

export class UpdateCreditorDto extends createZodDto(UpdateCreditorSchema) {}
