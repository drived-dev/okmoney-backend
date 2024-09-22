import { z } from 'zod';

// Define the Zod schema for Creditor
export const CreditorSchema = z.object({
  id: z.number().int().optional(), // Firestore auto-generates the ID, so it can be optional for creation
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  store_name: z.string().min(1, 'Store name is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  role_package: z.number().int(),
  created_at: z.number().int().optional(),
  updated_at: z.number().int().optional(),
  last_login: z.number().int().optional(),
  sms_available: z.number().int().optional(),
  debtor_slot_available: z.number().int().optional(),
  social_provider: z.number().int().optional(),
  profile_image: z.string().optional(),
});

// TypeScript type inferred from the schema
export type Creditor = z.infer<typeof CreditorSchema>;
