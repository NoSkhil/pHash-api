import { Result } from '../types/responseTypes';
import { COLLECTION_NAME, qdrantClient } from '../utils/qdrant';

const convertHashToVector = (hexHash: string): Result<number[]> => {
    if (!/^[0-9a-fA-F]+$/.test(hexHash)) return { success: false, code: 400, error: "Invalid hexadecimal hash" };
    if ((hexHash.length !== 64)) return { success: false, code: 400, error: "Invalid hexadecimal hash length" };

    let binaryString = '';
    for (let i = 0; i < hexHash.length; i++) {
        binaryString += parseInt(hexHash[i], 16).toString(2).padStart(4, '0');
    }
    return { success: true, data: binaryString.split('').map(bit => parseInt(bit)) };
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