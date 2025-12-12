import { z } from 'zod';

export const userRegisterSchema = z.object({
    name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(15, 'Name is too long'),
    email: z
    .email('Invalid email'),
    password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(255, 'Password is too long'),
    isAdmin: z
    .boolean()
    .default(false)
});

export const userLoginSchema = z.object({
    name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(15, 'Name is too long')
    .optional(),
    email: z
    .email('Invalid email')
    .optional(),
    password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(255, 'Password is too long'),
}).superRefine((data, ctx) => {
    const {name, email} = data;

    if (!name && !email){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least name or email must be provided',
            path: ['name', 'email'],
        })
    }
});