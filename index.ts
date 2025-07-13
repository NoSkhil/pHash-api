import express,{Request, Response} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import fileUploadRoutes from './routes/fileUploadRoutes';

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
});