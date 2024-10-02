import { z } from 'zod';
import { DebtorSchema } from '../entities/debtor.entity';

export const UpdateDebtorSchema = DebtorSchema.partial();
export type UpdateDebtorDto = z.infer<typeof UpdateDebtorSchema>;
