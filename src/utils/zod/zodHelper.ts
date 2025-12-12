import { z } from 'zod';

export const positiveInteger = (field: string) => {
    return z
        .number(`${field} must be a number`)
        .int(`${field} must be an integer`)
        .positive(`${field} must be positive`)
}