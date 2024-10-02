import { z } from 'zod';
import { GuarantorSchema } from '../entities/guarantor.entity';

export const UpdateGuaratorSchema = GuarantorSchema.partial();
export type UpdateGuarantorDto = z.infer<typeof UpdateGuaratorSchema>;
