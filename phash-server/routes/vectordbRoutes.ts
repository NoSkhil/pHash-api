import {Router} from 'express';
import hashUploadController from '../controllers/vectordbController';
import authenticateAPIKey from '../middleware/authenticateAPIKey';

const vectordbRoutes = Router();

vectordbRoutes.post("/uploadillegalhash",[authenticateAPIKey], hashUploadController.embedHashes);

export default vectordbRoutes;