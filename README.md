Image verification system to detect illegal and copyrighted content using perceptual hashing and vector similarity. 
Built to scale horizontally with Redis job queues. 
The architecture can handle videos by converting frames to hashes at intervals.


Why not use machine learning?

- Hashes are significantly faster to compute and compare, no GPU requirements, easier to scale
- Better for legal compliance since you can prove exact matches (which accounts for >90% of illegaly hosted content) rather than probability scores
- Stores only hash fingerprints, avoiding the retention of potentially illegal/copyrighted image data
- DMCA law requires platforms to implement technical measures to prevent copyright infringement, hash-based filtering is cost-effective and demonstrates compliance
- (https://www.law.cornell.edu/uscode/text/17/512)

<img src="docs/phash-architecture.svg" alt="Phash System Architecture" width="800"/>

Vector Database for Similarity Search

- Scales better than naive hash comparison as the database of illegal/copyrighted hashes grows

Redis Queue for Job Processing

- Enables horizontal scaling by adding more worker instances

Perceptual Hashing (pHash)

- https://www.hackerfactor.com/blog/?/archives/432-Looks-Like-It.html
