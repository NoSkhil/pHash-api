import {Router} from 'express';
import hashUploadController from '../controllers/vectordbController';
import authenticateAPIKey from '../middleware/authenticateAPIKey';

const hashUploadRoutes = Router();

hashUploadRoutes.post("/uploadillegalhash",[authenticateAPIKey], hashUploadController.embedHashes);

export default hashUploadRoutes;