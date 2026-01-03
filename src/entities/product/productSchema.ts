import { z } from 'zod';
import { positiveInteger } from '../../utils/zod/zodHelper';

export const createProductSchema = z.object({
    name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(20, 'Name is too long'),
    description: z
    .string()
    .max(400, 'Description is too long'),
    category: z.string(),
    image: z.string(),
    price: positiveInteger('Price'),
    stock: positiveInteger('Stock'),
});

export const findProductSchema = z.object({
    name: z
    .string()
    .optional(),
    category: z.string().optional(),
    minPrice: positiveInteger('Minimum Price').optional(),
    maxPrice: positiveInteger('Maximum Price').optional(),
    stock: positiveInteger('stock').optional(),
}).superRefine((data, ctx) => {
    const { minPrice, maxPrice } = data;
    if (!minPrice || !maxPrice){
        return;
    }
    
    if (minPrice > maxPrice){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'The minimum price cannot be greater than the maximum price',
            path: ['minPrice', 'maxPrice'],
        });
    }
});

export const updateProductSchema = z.object({
    name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(20, 'Name is too long')
    .optional(),
    description: z
    .string()
    .max(400, 'Description is too long')
    .optional(),
    category: z
    .string()
    .optional(),
    image: z
    .string()
    .optional(),
    price: positiveInteger('Price').optional(),
    stock: positiveInteger('Stock').optional(),
});