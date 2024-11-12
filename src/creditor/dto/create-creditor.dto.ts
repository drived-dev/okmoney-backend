import { createZodDto } from '@anatine/zod-nestjs';
import { CreditorSchema } from '../entities/creditor.entity';

// TODO: Separate the schema and dto based on different register method
export const CreateCreditorSchema = CreditorSchema.partial();

export class CreateCreditorDto extends createZodDto(CreateCreditorSchema) {}
