import { z } from 'zod';

export const userIdSchema = z.object({
   userId: z.string().trim().regex(/^\d+$/), 
});

export const productIdSchema = z.object({
    productId: z.string().trim().regex(/^\d+$/),
});

export const cartIdSchema = z.object({
    cartId: z.string().trim().regex(/^\d+$/),
});

export const couponIdSchema = z.object({
    couponId: z.string().trim().regex(/^\d+$/),
});

export const orderIdSchema = z.object({
    orderId: z.string().trim().regex(/^\d+$/),
});

export const reviewIdSchema = z.object({
    reviewId: z.string().trim().regex(/^\d+$/),
});