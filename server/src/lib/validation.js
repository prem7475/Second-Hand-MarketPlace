import { z } from 'zod'

const imageUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  })

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8)
    .max(72)
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'Password must be at most 72 bytes.',
    ),
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
})

export const listingSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(3000),
  price: z.number().finite().min(0).max(100000000),
  category: z.enum([
    'Furniture',
    'Electronics',
    'Fashion',
    'Home & Living',
    'Sports',
    'Books',
    'Other',
  ]),
  condition: z.enum(['Like new', 'Excellent', 'Good', 'Fair']),
  location: z.string().trim().min(2).max(100),
  images: z.array(imageUrlSchema).max(8).default([]),
  status: z.enum(['active', 'sold']).optional(),
})

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
})

export const listingQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    category: z
      .enum(['Furniture', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Other'])
      .optional(),
    condition: z.enum(['Like new', 'Excellent', 'Good', 'Fair']).optional(),
    location: z.string().trim().max(100).optional(),
    minPrice: z.coerce.number().finite().min(0).optional(),
    maxPrice: z.coerce.number().finite().min(0).optional(),
    sort: z.enum(['newest', 'price-low', 'price-high']).default('newest'),
    page: z.coerce.number().int().min(1).max(10000).default(1),
    limit: z.coerce.number().int().min(1).max(24).default(12),
    status: z.enum(['active', 'sold']).default('active'),
  })
  .strict()
  .refine(
    (filters) =>
      filters.minPrice === undefined ||
      filters.maxPrice === undefined ||
      filters.minPrice <= filters.maxPrice,
    {
      message: 'Minimum price cannot exceed maximum price.',
      path: ['minPrice'],
    },
  )

export function validate(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    }
  }
  return { success: true, data: result.data }
}
