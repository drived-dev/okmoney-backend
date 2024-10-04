import { createZodDto } from '@anatine/zod-nestjs';
import { CreditorSchema } from '../entities/creditor.entity';

export const CreateCreditorSchema = CreditorSchema.pick({
  firstName: true,
  lastName: true,
  storeName: true,
  phoneNumber: true,
  email: true,
  rolePackage: true,
});

export class CreateCreditorDto extends createZodDto(CreateCreditorSchema) {}
