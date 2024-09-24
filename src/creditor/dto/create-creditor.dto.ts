import { z } from 'zod';
import { CreditorSchema } from '../entities/creditor.entity';

export const CreateCreditorSchema = CreditorSchema.pick({
  first_name: true,
  last_name: true,
  store_name: true,
  phone_number: true,
  email: true,
  role_package: true,
});

export type CreateCreditorDto = z.infer<typeof CreateCreditorSchema>;
