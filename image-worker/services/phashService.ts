import { Image, ImageVerification, CreateImageVerificationRecord } from '../types/imageTypes';
import { Result } from '../types/responseTypes';
import pHash from 'sharp-phash';
import { existsSync as fileExists } from 'fs';
import { qdrantClient, COLLECTION_NAME, SIMILARITY_THRESHOLD, QdrantSearchResultItem } from '../utils/qdrant';
import db from '../prisma/client';

const convertHashToVector = (hexHash: string): Result<number[]> => {
    if (!/^[0-9a-fA-F]+$/.test(hexHash)) return { success: false, code: 400, error: "Invalid hexadecimal hash" };
    if ((hexHash.length !== 64)) return { success: false, code: 400, error: "Invalid hexadecimal hash length" };

    let binaryString = '';
    for (let i = 0; i < hexHash.length; i++) {
        binaryString += parseInt(hexHash[i], 16).toString(2).padStart(4, '0');
    }
    return { success: true, data: binaryString.split('').map(bit => parseInt(bit)) };
};

const hashImage = async (imageUrl: string): Promise<Result<string>> => {
    try {
        if (!fileExists(imageUrl)) return { success: false, code: 404, error: `Image not found at: ${imageUrl}` };

        const perceptualHash = await pHash(imageUrl);
        return { success: true, data: perceptualHash };
    } catch (err: any) {
        return { success: false, code: 500, error: err.message || "Internal Server Error" };
    }
};

const createImageVerificationRecord = async (imageVerificationData: CreateImageVerificationRecord): Promise<Result<ImageVerification>> => {
    try {
        const image = await db.imageVerification.create({data:imageVerificationData});
        return {success:true, data:image}
    }
    catch (err: any) {
        return { success: false, code: 500, error: err.message || "Internal Server Error" }
    }
};

const searchSimilarHashes = async (queryVector: number[], limit: number, scoreThreshold: number): Promise<Result<QdrantSearchResultItem[]>> => {
    try {
        const searchResults = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryVector,
            limit: limit,
            score_threshold: scoreThreshold,
            with_payload: true,
            with_vector: false
        });

        const mappedResults: QdrantSearchResultItem[] = searchResults.map(result => ({
            id: result.id,
            score: result.score,
            payload: result.payload || null,
        }));

        return { success: true, data: mappedResults };

    } catch (err: any) {
        return { success: false, code: 500, error: err.message || "Internal Server Error" };
    }
};

const checkImageContent = async (image: Image): Promise<Result<QdrantSearchResultItem[]>> => {
    try {
        if (!image?.url) return { success: false, code: 400, error: "Invalid image object" };

        const imageHash = await hashImage(image.url);
        if (!imageHash.success) return { success: false, code: imageHash.code, error: imageHash.error };

        const convertImageHashToVector = convertHashToVector(imageHash.data);
        if (!convertImageHashToVector.success) return { success: false, code: convertImageHashToVector.code, error: convertImageHashToVector.error };

        const similarHashes = await searchSimilarHashes(convertImageHashToVector.data, 5, SIMILARITY_THRESHOLD);
        if (!similarHashes.success) return { success: false, code: similarHashes.code, error: similarHashes.error };    
/*
        const isIllegal = similarHashes.data.length > 0;

        const verificationRecordData: CreateImageVerificationRecord = {
            imageId: image.id,
            hash: imageHash.data,
            isVerified: true,
            isIllegal: isIllegal,
            verifiedAt: new Date(),
            matchedHashes: similarHashes.data.length > 0 ? similarHashes.data as any : null
        };

        // Create the image verification record
        const recordCreationResult = await createImageVerificationRecord(verificationRecordData);

*/
        return { success: true, data: similarHashes.data };

    } catch (err: any) {
        return { success: false, code: 500, error: err.message || "Internal Server Error" };
    }
};

export default {
    hashImage,
    checkImageContent
};