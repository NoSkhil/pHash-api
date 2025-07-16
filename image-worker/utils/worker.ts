import { Worker, Job } from 'bullmq';
import phashService from '../services/phashService';
import { Image } from '../types/imageTypes';
import { redisConnection } from '../utils/redis';

export async function initialiseImageWorker() {

    const worker = new Worker('image_processing_queue', async (job: Job<Image>) => {
        console.log(`Worker: Processing job ${job.id} for image ID ${job.data.id}`);

        job.data.url = `../phash-server/${job.data.url}`; // This line is for local testing. In a production setup, 'job.data.url' would contain an s3 url.
        const result = await phashService.checkImageContent(job.data);

        if (!result.success) throw new Error(`Processing failed: ${result.error}`);

        return { message: 'Image processed successfully', results: result.data };

    }, {
        connection: redisConnection,
        concurrency: 1,
        autorun: true
    });

    worker.on('completed', (job: Job) => {
        console.log(`Worker: Job ${job.id} completed. Result:`, job.returnvalue);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
        console.error(`Worker: Job ${job?.id} failed with error: ${err.message}`);
    });

    worker.on('error', (err) => {
        console.error('Worker: uncaught error:', err);
    });

    return worker;
}