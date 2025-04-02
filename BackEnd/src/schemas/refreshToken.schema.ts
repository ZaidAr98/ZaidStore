import { boolean, object, string, TypeOf } from 'zod';

export const refreshTokenSchema = object({
  body: object({
    id: string().optional(),
  
    email: string().email('Invalid email').optional(),

  }),
});


export type refreshTokenInput = TypeOf<typeof refreshTokenSchema>['body']

















