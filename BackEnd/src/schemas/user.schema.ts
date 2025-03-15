import { boolean, object, string, TypeOf } from 'zod';

export const createUserSchema = object({
  body: object({
    name: string({ required_error: 'Name is required' }),
    email: string({ required_error: 'Email is required' }).email(
      'Invalid email'
    ),
   
    phone: string({ required_error: 'Phone number is required' })
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits').optional(),
    password: string({ required_error: 'Password is required' })
      .min(6, 'Password must be more than 6 characters').optional(),
    
})})


export const creatAdminSchema = object({
  body: object({
    name: string({ required_error: 'Name is required' }).optional(),
    email: string({ required_error: 'Email is required' }).email(
      'Invalid email'
    ),
    role:string({required_error:"role is required"}).optional(),
    phone: string({ required_error: 'Phone number is required' })
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits').optional(),
    password: string({ required_error: 'Password is required' })
      .min(6, 'Password must be more than 6 characters').optional(),
    
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


export const sendOTPSchema = object({
  body: object({
    email: string({ required_error: 'sendingOTP is required' }).email(
      'Invalid OTP'
    ),
  }),
});




export const verifyOTPSchema = object({
  body: object({
    email: string({ required_error: 'Email is required' }).email(
      'Invalid email'
    ),
    otp:string({ required_error: 'otp is required' })
  }),
});




export type CreateUserInput = TypeOf<typeof createUserSchema>['body'];
export type CreateAdminInput = TypeOf<typeof creatAdminSchema>['body'];
export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];
export type sendOTPInput = TypeOf<typeof sendOTPSchema>['body'];
export type verifyOTPInput = TypeOf<typeof verifyOTPSchema>['body']