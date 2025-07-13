import fileUploadService from "../services/fileUploadService";
import { Response } from "express";
import { FileUploadRequest } from "../types/requestTypes";
import { CreateImageRecord } from "../types/imageTypes";


const uploadImage = async (req: FileUploadRequest, res: Response) => {
    try {

        const file = req.file;
        if (!file) return res.status(400).send("No image uploaded");

        const imageData : CreateImageRecord = {
            url: file.path,
            filename: file.filename,
            original_name: file.originalname,
            mimetype: file.mimetype
        };

        const uploadImage = await fileUploadService.uploadImage(imageData);
        if (!uploadImage.success) return res.status(uploadImage.code).send(uploadImage.error);

        return res.status(200).send(uploadImage.data);

    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
}

export default {
    uploadImage
};