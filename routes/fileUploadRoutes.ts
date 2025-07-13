import {Router} from 'express';
import fileUploadController from '../controllers/fileUploadController';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' })

const fileUploadRoutes = Router();

fileUploadRoutes.post("/image",[upload.single('image')], fileUploadController.uploadImage);

export default fileUploadRoutes;