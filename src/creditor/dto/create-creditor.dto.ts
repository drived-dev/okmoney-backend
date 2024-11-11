import { createZodDto } from '@anatine/zod-nestjs';
import { CreditorSchema } from '../entities/creditor.entity';

export const CreateCreditorSchema = CreditorSchema.pick({
  firstName: true,
  lastName: true,
  storeName: true,
  rolePackage: true,
  tags: true,
  phoneNumber: true
}).partial();

export class CreateCreditorDto extends createZodDto(CreateCreditorSchema) {}
