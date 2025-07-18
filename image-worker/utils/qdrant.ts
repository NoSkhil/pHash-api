import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrantClient = new QdrantClient({ 
    host: process.env.QDRANT_HOST || "localhost",
    port: parseInt(process.env.QDRANT_PORT || '6333')
});

export const PHASH_DIMENSIONS = parseInt(process.env.PHASH_DIMENSIONS || '64');

export const COLLECTION_NAME = process.env.COLLECTION_NAME || "illegal_hashes";
export const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '50.0');

export const initializeQdrantCollection = async (): Promise<void> => {
    try {
        const qdrantData = await qdrantClient.getCollections();
        const collectionExists = qdrantData.collections.some(col => col.name === COLLECTION_NAME);

        if (!collectionExists) throw new Error("Qdrant Error: Illegal hashes database not found");
    } catch (err) { throw err };
};

export interface QdrantSearchResultItem {
    id: string | number;
    score: number;
    payload?: Record<string, any> | null;
};