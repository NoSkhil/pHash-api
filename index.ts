import express,{Request, Response} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import fileUploadRoutes from './routes/fileUploadRoutes';
import { createClient } from '@supabase/supabase-js'
import { Image } from './types/imageTypes';
import hashingService from './services/phashService';
import { initializeQdrantCollection } from './utils/qdrant';

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

app.get('/', (req:Request,res:Response)=> res.status(200).send("phash server."));
app.use('/api', apiRouter);

apiRouter.use('/upload', fileUploadRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, async ()=>{
console.log(`pHash server running at port - ${PORT}`);
await initializeQdrantCollection();

supabase
  .channel('image_uploads', { config: { private: true } })
  .on('broadcast', { event: 'INSERT' }, async (event) => {
    const image: Image = event.payload.record;
    const result = await hashingService.checkImageContent(image);
    console.log(result);

  })
  .subscribe()
});