import { Result } from '../types/responseTypes';
import { COLLECTION_NAME, qdrantClient, PHASH_DIMENSIONS } from '../utils/qdrant';

const convertHashToVector = (binaryHash: string): Result<number[]> => {
    if (!/^[01]+$/.test(binaryHash)) return { success: false, code: 400, error: "Invalid binary hash string" };
    if (binaryHash.length !== PHASH_DIMENSIONS) return { success: false, code: 400, error: "Invalid binary hash length" };

    // Map '0' bits to -1.0 and '1' bits to 1.0, necessary for the Dot product to correctly emulate Hamming distance
    const vectorData = binaryHash.split('').map(bit => (parseInt(bit, 10) === 1 ? 1.0 : -1.0));

    return { success: true, data: vectorData };
};

const embedIllegalHashes = async (hashes: string[]): Promise<Result<string>> => {
    try {
        const embedPromises = hashes.map(async (hash) => {
            const vectorResult = convertHashToVector(hash);

            if (!vectorResult.success) throw new Error(`Failed to convert hash ${hash} to vector: ${vectorResult.error}`);

            const points = [{
                id: hash,
                vector: vectorResult.data,
                payload: { original_hash: hash }
            }];

            return qdrantClient.upsert(COLLECTION_NAME, { points });
        });

        await Promise.all(embedPromises);
        return { success: true, data: `${hashes.length} hashes embedded in vector db.` };

    } catch (err: any) {
        console.error("Failed to upload illegal hash to Qdrant:", err);
        return { success: false, code: 500, error: err.message || "Internal Server Error" };
    }
};

export default {
    embedIllegalHashes
};