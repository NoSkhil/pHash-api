import {Router} from 'express';
import vectordbController from '../controllers/vectordbController';
import authenticateAPIKey from '../middleware/authenticateAPIKey';

const vectordbRoutes = Router();

vectordbRoutes.post("/uploadillegalhash",[authenticateAPIKey], vectordbController.embedHashes);

export default vectordbRoutes;