import { Image, ImageVerification, CreateImageVerificationRecord } from '../types/imageTypes';
import { Result } from '../types/responseTypes';
import pHash from 'sharp-phash';
import { existsSync as fileExists } from 'fs';
import { qdrantClient, COLLECTION_NAME, SIMILARITY_THRESHOLD, QdrantSearchResultItem, PHASH_DIMENSIONS} from '../utils/qdrant';
import db from '../prisma/client';

const convertHashToVector = (binaryHash: string): Result<number[]> => {
    if (!/^[01]+$/.test(binaryHash)) return { success: false, code: 400, error: "Invalid binary hash string" };
    if (binaryHash.length !== PHASH_DIMENSIONS) return { success: false, code: 400, error: "Invalid binary hash length" };

    // Map '0' bits to -1.0 and '1' bits to 1.0, necessary for the Dot product to correctly emulate Hamming distance
    const vectorData = binaryHash.split('').map(bit => (parseInt(bit, 10) === 1 ? 1.0 : -1.0));

    return { success: true, data: vectorData };
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

const checkImageContent = async (image: Image): Promise<Result<ImageVerification>> => {
    try {
        if (!image.url || !image.id) return { success: false, code: 400, error: "Invalid image object" };

        const imageHash = await hashImage(image.url);
        if (!imageHash.success) return { success: false, code: imageHash.code, error: imageHash.error };

        const imageVectorEmbedding = convertHashToVector(imageHash.data);
        if (!imageVectorEmbedding.success) return { success: false, code: imageVectorEmbedding.code, error: imageVectorEmbedding.error };

        const similarHashes = await searchSimilarHashes(imageVectorEmbedding.data, 5, SIMILARITY_THRESHOLD);
        if (!similarHashes.success) return { success: false, code: similarHashes.code, error: similarHashes.error };    

        const isIllegal = similarHashes.data.length > 0;

        const verificationRecordData: CreateImageVerificationRecord = {
            imageId: image.id,
            hash: imageHash.data,
            isVerified: true,
            isIllegal: isIllegal,
            verifiedAt: new Date(),
            matchedHashes: similarHashes.data.length > 0 ? similarHashes.data as any : null
        };

        const imageVerificationRecord = await createImageVerificationRecord(verificationRecordData);
        if (!imageVerificationRecord.success) return { success: false, code: imageVerificationRecord.code, error: imageVerificationRecord.error };  

        return { success: true, data: imageVerificationRecord.data };

    } catch (err: any) {
        return { success: false, code: 500, error: err.message || "Internal Server Error" };
    }
};

export default {
    hashImage,
    checkImageContent
};