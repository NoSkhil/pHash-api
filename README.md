Image verification system to detect illegal and copyrighted content using perceptual hashing and vector similarity. 
Built to scale horizontally with Redis job queues. 
The architecture can handle videos by converting frames to hashes at intervals.


Why not use machine learning?

- Hashes are significantly faster to compute and compare, no GPU requirements, easier to scale
- Better for legal compliance since you can prove exact matches (which accounts for >90% of illegaly hosted content) rather than probability scores
- Stores only hash fingerprints, avoiding the retention of potentially illegal/copyrighted image data
- DMCA law requires platforms to implement technical measures to prevent copyright infringement, hash-based filtering is cost-effective and demonstrates compliance
- (https://www.law.cornell.edu/uscode/text/17/512)

## System Architecture
<img src="docs/phash-architecture.svg" alt="Phash System Architecture" width="800"/>

Vector Database for Similarity Search

- Scales better than naive hash comparison as the database of illegal/copyrighted hashes grows

Redis Queue for Job Processing

- Enables horizontal scaling by adding more worker instances

Perceptual Hashing (pHash)

- https://www.hackerfactor.com/blog/?/archives/432-Looks-Like-It.html


--x--


Hamming Distance for similarity of binary strings
- How many bit positions differ in a binary string.
- Lower Hamming distance indicates higher similarity.
Eg, For the binary strings `00010` and `00001`, bits differ at positions 4 and 5. So the Hamming distance is 2.

Dot Product for similarity of binary vectors
Eg, 
1) For binary vectors v1 = [0, 1, 1, 0] and v2 = [0, 1, 0, 1]
2) Dot Product = (0 x 0) + (1 x 1) + (1 x 0) + (0 x 1) = 0 + 1 + 0 + 0 = 1.
3) H1, Hamming weight of v1 (number of non-zero elements) = 2
4) H2, Hamming weight of v2 = 2
3) Hamming Distance =  (H1+ H2) - 2 x Dot Product = (2 + 2) - (2 x 1) = 2

Converting Hash to Vectors:
To use Dot Product to get the Hamming distance, 
1) The binary pHash is transformed into a vector of -1.0s and 1.0s
2) 0 bits become -1.0 and 1 bits become 1.0. 
3) The Dot Product then directly reflects the original Hamming distance.
Eg,
1) Binary Hash A: `1010` is converted to Vector Va: [1.0, -1.0, 1.0, -1.0].
2) Binary Hash B: `1001` is converted to Vector Vb: [1.0, -1.0, -1.0, 1.0].
3) Dot Product = (1 x 1) + (-1 x -1) + (1 x -1) + (-1 x 1) = 1 + 1 - 1 - 1 = 0.
4) For these 4-bit hashes, a Dot Product of 0 corresponds to a Hamming distance of 2
- Dot Product = N (length of hash) - 2 x H (Hamming distance)
- 0 = 4 - 2H
- H = 2 

## Environment Variables

Create a `.env` file in the server and worker directories:

```env
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
COLLECTION_NAME=illegal_hashes
SIMILARITY_THRESHOLD=3
QDRANT_HOST=localhost
QDRANT_PORT=6333
REDIS_URL=redis://localhost:6379
