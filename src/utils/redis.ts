import { createClient } from 'redis';

export const redis = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redis.on('error', (err) => console.log('Error on redis: ', err));

redis.connect();

