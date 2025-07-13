import db from '../prisma/client';
import { CreateImageRecord, Image } from '../types/imageTypes';
import { Result } from '../types/responseTypes';

const getImageById = async (id: string): Promise<Result<Image>> => {
    try {
        const image = await db.image.findUnique({ where: { id } });
        if (!image) return { success: false, code: 404, error: "Invalid Image ID" };

        else return { success: true, data: image };
    }
    catch (err) {
        console.log(err);
        return { success: false, code: 500, error: "Internal Server Error" }
    }
};

const uploadImage = async (imageData: CreateImageRecord): Promise<Result<Image>> => {
    try {
        const image = await db.image.create({data:imageData});
        return {success:true, data:image}
    }
    catch (err) {
        console.log(err);
        return { success: false, code: 500, error: "Internal Server Error" }
    }
};

export default {
    getImageById,
    uploadImage
};