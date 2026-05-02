import { z } from 'zod';
import type { Role } from '../../../types';

export const roleEnum = z.enum(['user', 'mechanic', 'seller']);

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: roleEnum,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
