import { TypeOf, z } from 'zod';


export const categorySchema = z.object({
  body:z.object({
  name: z.string({ required_error: 'Name is required.' }).optional(),
  description: z.string({ required_error: 'Description is required.' }).optional(),
})});

// Type inference for the category schema
export type categoryInput = TypeOf<typeof categorySchema>['body']


