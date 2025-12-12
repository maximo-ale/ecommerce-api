import { z } from 'zod';
import { positiveInteger } from '../../utils/zod/zodHelper';
import { productIdSchema } from '../../utils/zod/idSchema';

export const addProductToCartSchema = productIdSchema.extend({
    quantity: positiveInteger('quantity'),
});

export const updateQuantitySchema = z.object({
    quantity: positiveInteger('quantity').min(1),
});

export const addCouponSchema = z.object({
    code: z.string(),
});