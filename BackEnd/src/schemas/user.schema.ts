import { object, string, TypeOf } from 'zod';

export const createUserSchema = object({
  body: object({
    name: string({ required_error: 'Name is required' }),
    email: string({ required_error: 'Email is required' }).email(
      'Invalid email'
    ),
    role: string().optional(), 
    phone: string({ required_error: 'Phone number is required' })
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
    password: string({ required_error: 'Password is required' })
      .min(6, 'Password must be more than 6 characters')
    
})})


export const loginUserSchema = object({
  body: object({
    email: string({ required_error: 'Email is required' }).email(
      'Invalid email or password'
    ),
    password: string({ required_error: 'Password is required' }).min(
      6,
      'Invalid email or password'
    ),
  }),
});



export type CreateUserInput = TypeOf<typeof createUserSchema>['body'];
export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];