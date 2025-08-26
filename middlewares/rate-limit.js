import limiter from 'express-rate-limit';

export const rateLimit = limiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many requests, try again later',
});

export const registerAndLoginLimit = limiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many register and login requests, try again later',
});