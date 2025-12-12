import { z } from 'zod';

export const createReviewSchema = z.object({
    comment: z
    .string()
    .min(1, 'Comment must be provided'),
    rating: z
    .int()
    .min(1, 'Minimum rating value is 1')
    .max(5, 'Maximum rating value is 5'),
});

export const updateReviewSchema = z.object({
    comment: z
    .string()
    .min(1, 'Comment must be provided')
    .optional(),
    rating: z
    .int()
    .min(1, 'Minimum rating value is 1')
    .max(5, 'Maximum rating value is 5')
    .optional(),
}).superRefine((data, ctx) => {
    const { comment, rating } = data;

    // Ensure at least 1 change is being made
    if (!comment && !rating){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least 1 field must be provided',
        });
    }
});