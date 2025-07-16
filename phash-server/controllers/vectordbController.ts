import hashUploadService from "../services/vectordbService";
import { Request, Response } from "express";


const embedHashes = async (req: Request, res: Response) => {
    try {
        const hashes:string[] = req.body;

        const hashUpload = await hashUploadService.embedIllegalHashes(hashes);
        if (!hashUpload.success) return res.status(hashUpload.code).send(hashUpload.error);

        return res.status(200).send(hashUpload.data);

    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
}

export default {
    embedHashes
};