import { z } from 'zod';
import { GuarantorSchema } from '../entities/guarantor.entity';

export const CreateGuarantorScehma = GuarantorSchema.pick({
  firstName: true,
  lastName: true,
  phoneNumber: true,
});

export type CreateGuarantorDto = z.infer<typeof CreateGuarantorScehma>;
