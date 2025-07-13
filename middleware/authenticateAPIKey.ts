import { Request, Response, NextFunction } from 'express';

const authenticateAPIKey = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const apiKey = req.headers['x-api-key'] || 
                      req.headers['apikey'] || 
                      req.headers['api-key'];

        if (!apiKey) {
            res.status(401).json({ error: 'API key required' });
            return;
        }

        const validAPIKeys = process.env.VALID_API_KEYS?.split(',') || [];
        
        if (!validAPIKeys.includes(apiKey as string)) {
            res.status(403).json({ error: 'Invalid API key' });
            return;
        }

        next();
    } catch (err) {
        console.error('API Key Authentication error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default authenticateAPIKey;