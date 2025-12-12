import limiter from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../utils/errors';
const isTest = process.env.NODE_ENV === 'test';

export const rateLimit = isTest
    ? (req: Request, res: Response, next: NextFunction) => next()
    : limiter({
    windowMs: 5 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            error: 'too_many_requests',
            message: 'Too many requests, try again later',
        });
    },
});

export const registerAndLoginLimit = isTest
    ? (req: Request, res: Response, next: NextFunction) => next()
    : limiter({
    windowMs: 2 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            error: 'too_many_requests',
            message: 'Too many requests, try again later',
        });
    },
});

export const checkoutLimit = isTest
    ? (req: Request, res: Response, next: NextFunction) => next()
    : limiter({
    windowMs: 2 * 60 * 1000,
    max: 10,

    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
        return req.userId!
    },

    handler: (req, res) => {
        return res.status(429).json({
            error: 'too_many_requests',
            message: 'Too many requests, try again later',
        });
    },
});