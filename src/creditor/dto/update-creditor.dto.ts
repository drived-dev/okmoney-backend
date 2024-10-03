import { z } from 'zod';
import { CreditorSchema } from '../entities/creditor.entity';

export const UpdateCreditorSchema = CreditorSchema.partial();

export type UpdateCreditorDto = z.infer<typeof UpdateCreditorSchema>;
