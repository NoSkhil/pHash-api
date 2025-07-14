import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrantClient = new QdrantClient({ 
    host: process.env.QDRANT_HOST || "localhost",
    port: parseInt(process.env.QDRANT_PORT || '6333')
});

export const COLLECTION_NAME = process.env.COLLECTION_NAME || "illegal_hashes";
export const SIMILARITY_THRESHOLD = parseInt(process.env.SIMILARITY_THRESHOLD || '3');

export const initializeQdrantCollection = async (): Promise<void> => {
    try {
        const qdrantData = await qdrantClient.getCollections();
        const collectionExists = qdrantData.collections.some(col => col.name === COLLECTION_NAME);

        if (!collectionExists) await qdrantClient.createCollection(COLLECTION_NAME, { vectors: { size: 256, distance: 'Euclid' }});

        console.log("Vector DB initialised");

    } catch (err) { throw err };
};

export interface QdrantSearchResultItem {
    id: string | number;
    score: number;
    payload?: Record<string, any> | null;
};