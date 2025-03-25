import { TypeOf, z } from 'zod';

// Define the Zod schema for the Product
export const productSchema = z.object({
  body:z.object({
  name: z.string({ required_error: 'Name is required.' }).optional(),
  company: z.string({ required_error: 'Company is required.' }).optional(),
  description: z.string({ required_error: 'Description is required.' }).optional(),
  price: z
    .number({ required_error: 'Price is required.' })
    .min(0, 'Price cannot be negative.').optional(),
  laptopType: z.enum(['PC', 'Laptop'], {
    required_error: 'Laptop type is required.',
    invalid_type_error: 'Laptop type must be either "PC" or "Laptop".',
  }).optional(),
  categoryId: z.string({ required_error: 'Category ID is required.' }).optional(),
    sizes: z
    .array(
      z.object({
        _id:z.string({required_error: 'Id is required.'}).optional(),
        size: z.string({ required_error: 'Size is required.' }),
        price: z
          .number({ required_error: 'Price is required.' })
          .min(1, 'Price must be at least 1.')
          .max(8000, 'Price cannot exceed 8000.'),
        stock: z
          .number({ required_error: 'Stock is required.' })
          .min(0, 'Stock cannot be negative.')
          .max(1000, 'Stock cannot exceed 1000.'),
      })
    )
    .min(1, 'At least one size is required.').optional(),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})});



// import { z } from 'zod';

// // Helper function to validate MongoDB ObjectId
// const isValidObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

// export const productSchema = z.object({
//   body: z.object({
//     name: z.string({ required_error: 'Name is required.' }),
//     company: z.string({ required_error: 'Company is required.' }),
//     description: z.string({ required_error: 'Description is required.' }),
//     price: z
//       .number({ required_error: 'Price is required.' })
//       .min(0, 'Price cannot be negative.'),
//     laptopType: z.enum(['PC', 'Laptop'], {
//       required_error: 'Laptop type is required.',
//       invalid_type_error: 'Laptop type must be either "PC" or "Laptop".',
//     }),
//     categoryId: z
//       .string({ required_error: 'Category ID is required.' })
//       .refine((value) => isValidObjectId(value), {
//         message: 'Category ID must be a valid MongoDB ObjectId.',
//       }),
//     sizes: z
//       .array(
//         z.object({
//           size: z.string({ required_error: 'Size is required.' }),
//           price: z
//             .number({ required_error: 'Price is required.' })
//             .min(1, 'Price must be at least 1.')
//             .max(8000, 'Price cannot exceed 8000.'),
//           stock: z
//             .number({ required_error: 'Stock is required.' })
//             .min(0, 'Stock cannot be negative.')
//             .max(1000, 'Stock cannot exceed 1000.'),
//         })
//       )
//       .min(1, 'At least one size is required.'),
//     images: z
//       .array(z.string({ required_error: 'Image URL is required.' }))
//       .min(1, 'At least one image is required.')
//       .max(4, 'Cannot upload more than 4 images.'),
//   }),
// });

// export type ProductInput = z.infer<typeof productSchema>['body'];