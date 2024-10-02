import { z } from 'zod';

export const PaymentSchema = z.object({
  id: z.string().optional(),
  amount: z.number().min(0, 'Amount is required'),
  payment_date: z.date(),
  payment_type: z.string().optional(),
  image_url: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;
