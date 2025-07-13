import multer from 'multer';
import { Request } from 'express';

export interface FileUploadRequest extends Request {
    file?: multer.File;
}