import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import sharp from 'sharp';

// Giới hạn kích thước tối đa giữ nguyên chất lượng
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
// Chất lượng WebP (0-100). 82 = cân bằng tốt giữa dung lượng và chất lượng
const WEBP_QUALITY = 82;

@Injectable()
export class GridFSService {
    private bucket: GridFSBucket | null = null;

    constructor(private config: ConfigService) {}

    private async getBucket(): Promise<GridFSBucket> {
        if (this.bucket) return this.bucket;

        const uri = this.config.get<string>('MONGODB_URI')
            || this.config.get<string>('MONGODB_LOCAL_URI')
            || 'mongodb://localhost:27017/celebi_db';

        const client = new MongoClient(uri);
        await client.connect();

        const dbName = uri.split('/').pop()?.split('?')[0] || 'celebi_db';
        const db = client.db(dbName);
        this.bucket = new GridFSBucket(db, { bucketName: 'uploads' });
        return this.bucket;
    }

    /**
     * Nén ảnh về WebP, resize nếu quá lớn, giữ tỉ lệ gốc.
     * GIF → giữ nguyên (không nén để giữ animation).
     */
    private async compress(file: Express.Multer.File): Promise<{ buffer: Buffer; contentType: string }> {
        if (file.mimetype === 'image/gif') {
            return { buffer: file.buffer, contentType: 'image/gif' };
        }

        const buffer = await sharp(file.buffer)
            .rotate()                          // auto-rotate theo EXIF
            .resize(MAX_WIDTH, MAX_HEIGHT, {
                fit: 'inside',                 // giữ tỉ lệ, không crop
                withoutEnlargement: true,      // không phóng to ảnh nhỏ
            })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();

        return { buffer, contentType: 'image/webp' };
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const { buffer, contentType } = await this.compress(file);
        const bucket = await this.getBucket();

        return new Promise((resolve, reject) => {
            const readable = Readable.from(buffer);
            const ext = contentType === 'image/gif' ? '.gif' : '.webp';
            const filename = file.originalname.replace(/\.[^.]+$/, '') + ext;

            const uploadStream = bucket.openUploadStream(filename, {
                metadata: { contentType, originalName: file.originalname },
            });

            readable.pipe(uploadStream);
            uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
            uploadStream.on('error', reject);
        });
    }

    async downloadFile(id: string): Promise<{ stream: Readable; contentType: string }> {
        let objectId: ObjectId;
        try {
            objectId = new ObjectId(id);
        } catch {
            throw new NotFoundException('Invalid file ID');
        }

        const bucket = await this.getBucket();
        const files = await bucket.find({ _id: objectId }).toArray();
        if (!files.length) throw new NotFoundException('File not found');

        const stream = bucket.openDownloadStream(objectId) as unknown as Readable;
        const contentType = (files[0].metadata as any)?.contentType || 'image/webp';
        return { stream, contentType };
    }
}
