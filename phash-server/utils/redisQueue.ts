import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const imageProcessingQueue = new Queue('image_processing_queue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
});

imageProcessingQueue.on('error', (err) => {
    console.error('BullMQ Queue Error:', err);
});