import fileUploadService from "../services/fileUploadService";
import { Response } from "express";
import { FileUploadRequest } from "../types/requestTypes";
import { CreateImageRecord, Image_Format_Enum, Image_Format_Type } from "../types/imageTypes";
import { getImageFormat } from "../utils/mimeToEnum";


const uploadImage = async (req: FileUploadRequest, res: Response) => {
    try {

        const file = req.file;
        if (!file) return res.status(400).send("No image uploaded");

        const mimetype = getImageFormat(file.mimetype);
        if (!mimetype) return res.status(400).send("Unsupported image format");

        const imageData : CreateImageRecord = {
            url: file.path,
            filename: file.filename,
            original_name: file.originalname,
            mimetype
        };

        const imageUpload = await fileUploadService.uploadImage(imageData);
        if (!imageUpload.success) return res.status(imageUpload.code).send(imageUpload.error);

        return res.status(200).send(imageUpload.data);

    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
}

export default {
    uploadImage
};