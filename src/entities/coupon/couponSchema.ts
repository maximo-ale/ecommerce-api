import { z } from 'zod';
import { positiveInteger } from '../../utils/zod/zodHelper';

export const createCouponSchema = z.object({
    code: z
        .string(),
    maxUses: positiveInteger('Maximum uses'),
    maxDiscountAmount: positiveInteger('Maximum discount amount'),
    discountPercent: positiveInteger('Discount percent')
    .min(1, 'Discount percent cannot be less than 1')
    .max(100, 'Discount percent cannot be greater than 100'),

    expiresAt: z.preprocess((val) => {
        if (typeof val === 'string') return new Date(val);
        return val;
    },z
    .date()
    .refine((date) => date.getTime() > Date.now(), {
        message: 'Date must be a time in the future'
    }),
    ),
});