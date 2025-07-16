import dotenv from 'dotenv';
dotenv.config();
import { initializeQdrantCollection } from './utils/qdrant';
import { initialiseImageWorker } from './utils/worker';


async function startWorker() {
    try {
        await initializeQdrantCollection();
        console.log("Worker: Qdrant client initialized");

        await initialiseImageWorker();
        console.log('Image Worker Ready: Listening for jobs...');

    } catch (err) {
        console.error("Worker process crashed:", err);
        process.exit(1);
    }


}

startWorker();