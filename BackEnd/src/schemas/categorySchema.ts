import { TypeOf, z } from 'zod';


export const categorySchema = z.object({
    body:z.object({
        name: z
        .string()
        .trim()
        .min(3, { message: 'Category name should have at least 3 characters.' })
        .max(50, { message: 'Category name should have at most 50 characters.' })
        .refine((value) => value.trim() !== '', {
          message: 'Category name is required.',
        }),
    
      description: z
        .string()
        .trim()
        .min(10, { message: 'Description should have at least 10 characters.' })
        .max(200, { message: 'Description should have at most 200 characters.' })
        .refine((value) => value.trim() !== '', {
          message: 'Description is required.',
        }),
        isListed:z.boolean().optional()
    })
 
});

// Type inference for the category schema
export type categoryInput = TypeOf<typeof categorySchema>['body']


