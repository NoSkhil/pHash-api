import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Image } from '../types/imageTypes';
import { imageProcessingQueue } from './redisQueue';

const supabase = createSupabaseClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
)

export const subscribeToImageUploads = () => {
    try {
        supabase
            .channel('image_uploads', { config: { private: true } })
            .on('broadcast', { event: 'INSERT' }, async (event) => {
                const image: Image = event.payload.record;

                await imageProcessingQueue.add('processImage', image);
                console.log(`Image ${image.id} added to Redis queue.`);
            })
            .subscribe();
    } catch (err) {
        throw err;
    }
};