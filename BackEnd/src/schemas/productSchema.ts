import { TypeOf, z } from 'zod';

// Define the Zod schema for the Product
export const productSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }),
  company: z.string({ required_error: 'Company is required.' }),
  description: z.string({ required_error: 'Description is required.' }),
  price: z
    .number({ required_error: 'Price is required.' })
    .min(0, 'Price cannot be negative.'),
  discount: z
    .number({ required_error: 'Discount is required.' })
    .min(0, 'Discount cannot be negative.')
    .max(90, 'Discount cannot exceed 90%.'),
  laptopType: z.enum(['PC', 'Laptop'], {
    required_error: 'Laptop type is required.',
    invalid_type_error: 'Laptop type must be either "PC" or "Laptop".',
  }),
  offerId: z.string().nullable().optional(), // Optional field
  categoryId: z.string({ required_error: 'Category ID is required.' }),
  sizes: z
    .array(
      z.object({
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
    .min(1, 'At least one size is required.'),
  images: z
    .array(z.string({ required_error: 'Image URL is required.' }))
    .min(1, 'At least one image is required.'),
  totalStock: z.number().default(0), // Optional, calculated field
  isFeatured: z.boolean().default(false),
  isListed: z.boolean().default(true),
  reviews: z
    .array(
      z.object({
        name: z.string().optional(),
        rating: z.number().optional(),
        comment: z.string().optional(),
        createdAt: z.date().default(() => new Date()),
      })
    )
    .optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Export the schema
export type ProductInput = z.infer<typeof productSchema>;