import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import fileUploadRoutes from './routes/fileUploadRoutes';
import { createClient } from '@supabase/supabase-js'
import { Image } from './types/imageTypes';
import { initializeQdrantCollection } from './utils/qdrant';
import { getRedisClient } from './utils/redis';
import { imageProcessingQueue } from './utils/redisQueue';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
)

const app = express();
const apiRouter = express.Router();

app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true,
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => res.status(200).send("phash server."));
app.use('/api', apiRouter);

apiRouter.use('/upload', fileUploadRoutes);



const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`pHash server running at port - ${PORT}`);

  await initializeQdrantCollection();
  console.log("Vector DB initialised");

  let redisClient = await getRedisClient();
  console.log("Redis client connected.");

  supabase
    .channel('image_uploads', { config: { private: true } })
    .on('broadcast', { event: 'INSERT' }, async (event) => {
      try {
        const image: Image = event.payload.record;

        await imageProcessingQueue.add('processImage', image);
        console.log(`Image ${image.id} added to Redis queue.`);
      } catch (err) {
        console.error(`Failed to add image to redis queue:`, err);
      }
    })
    .subscribe()
});