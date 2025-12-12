import { z } from 'zod';

export const orderStatusSchema = z.object({
    status: z.enum(['pending', 'paid', 'sent', 'cancelled'], 'Invalid status value'),
});