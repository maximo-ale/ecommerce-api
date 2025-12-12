import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

function formatZodErrors(errors: any) {
    const formatted: any = {};
    for (const key in errors) {
        if (key === "_errors") continue;
        formatted[key] = errors[key]._errors;
    }
    return formatted;
}

const validate = (schema: any, type: 'body' | 'params' | 'query') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[type]);

        if (!result.success){
            return res.status(400).json({
                message: 'Invalid given values',
                values: formatZodErrors(result.error.format()),
                }
            );
        }

        Object.keys(req[type]).forEach(key => delete req[type][key]);
        Object.assign(req[type], result.data);

        next();
    }
}

export default validate;