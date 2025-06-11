import { Redis } from 'ioredis';

const getRedisUrl = () => {
    
    // Check if REDIS_URL is set in the environment variables
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
        return redisUrl;
    }

    // Throw out an error if the env variable is not set
    throw new Error('REDIS_URL environment variable is not set');

}

export const redis = new Redis(getRedisUrl())