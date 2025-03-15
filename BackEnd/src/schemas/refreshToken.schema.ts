import { boolean, object, string, TypeOf } from 'zod';

export const refreshTokenSchema = object({
  body: object({
    id: string().optional(),
    name: string().optional(),
    email: string().email('Invalid email').optional(),
    role: string().optional(),
    phone: string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must be less than 15 digits')
      .regex(/^[0-9]+$/, 'Phone number must contain only digits')
      .optional(),
    password: string()
      .min(6, 'Password must be more than 6 characters')
      .optional(),
  }),
});


export type refreshTokenInput = TypeOf<typeof refreshTokenSchema>['body']

















