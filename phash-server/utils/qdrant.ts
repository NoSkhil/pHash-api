import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrantClient = new QdrantClient({ 
    host: process.env.QDRANT_HOST || "localhost",
    port: parseInt(process.env.QDRANT_PORT || '6333')
});

export const COLLECTION_NAME = process.env.COLLECTION_NAME || "illegal_hashes";

export const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '180.0');

export const initializeQdrantCollection = async (): Promise<void> => {
    try {
        const qdrantData = await qdrantClient.getCollections();
        const collectionExists = qdrantData.collections.some(col => col.name === COLLECTION_NAME);

        if (!collectionExists) {
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: 256,
                    // Dot product directly correlates with Hamming distance. Dot Product = Total Bits − 2×Hamming Distance
                    distance: "Dot"
                },
                quantization_config: {
                    binary: {
                        always_ram: true
                    }
                }
            });
        }

    } catch (err: any) {
        console.error(`Error initializing Qdrant collection '${COLLECTION_NAME}':`, err.message);
        throw err;
    }
};

export interface QdrantSearchResultItem {
    id: string | number;
    score: number;
    payload?: Record<string, any> | null;
};
