import { createClient, RedisClientType } from 'redis';

const redisClientInstance: RedisClientType = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClientInstance.on('connect', () => {
    console.log('Redis: Connected successfully');
});

redisClientInstance.on('error', (err: any) => {
    console.error('Redis connection error:', err);
});

export const getRedisClient = async (): Promise<RedisClientType> => {
    if (!redisClientInstance.isReady) await redisClientInstance.connect();
    return redisClientInstance;
};

export const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
};