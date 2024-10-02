import { z } from 'zod';
import { CreditorSchema } from '../entities/creditor.entity';

export const CreateCreditorSchema = CreditorSchema.pick({
  firstName: true,
  lastName: true,
  storeName: true,
  phoneNumber: true,
  email: true,
  rolePackage: true,
});

export type CreateCreditorDto = z.infer<typeof CreateCreditorSchema>;
