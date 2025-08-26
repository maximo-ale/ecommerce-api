import limiter from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const rateLimit = isTest
    ? (req, res, next) => next()
    : limiter({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: 'Too many requests, try again later',
});

export const registerAndLoginLimit = isTest
    ? (req, res, next) => next()
    : limiter({
    windowMs: 2 * 60 * 1000,
    max: 10,
    message: 'Too many register and login requests, try again later',
});