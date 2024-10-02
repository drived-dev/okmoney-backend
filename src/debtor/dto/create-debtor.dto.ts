import { z } from 'zod';
import { DebtorSchema } from '../entities/debtor.entity';

export const CreateDebtorSchema = DebtorSchema.pick({
  firstName: true,
  lastName: true,
  nickname: true,
  phoneNumber: true,
  memoNote: true,
  autoSendSms: true,
  address: true,
  profileImage: true,
});

export type CreateDebtorDto = z.infer<typeof CreateDebtorSchema>;
