import {
    Controller, Post, UseInterceptors, UploadedFiles,
    UploadedFile, BadRequestException, UseGuards, Get, Param, Res
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

// Ensure uploads directory exists
const UPLOAD_DIR = join(process.cwd(), 'uploads');
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

const multerStorage = diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
    },
});

const imageFilter = (
    _req: any,
    file: Express.Multer.File,
    cb: (err: Error | null, accept: boolean) => void,
) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new BadRequestException('Chỉ chấp nhận file ảnh (jpg, png, webp)'), false);
    }
};

const SINGLE_OPTIONS = {
    storage: multerStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
};

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {

    /** Upload single image */
    @Post('image')
    @ApiOperation({ summary: 'Upload single image, returns URL' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('file', SINGLE_OPTIONS))
    uploadSingle(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Không tìm thấy file');
        return {
            url: `/api/v1/uploads/files/${file.filename}`,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
        };
    }

    /** Upload multiple images (max 10) */
    @Post('images')
    @ApiOperation({ summary: 'Upload multiple images (max 10)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
            },
        },
    })
    @UseInterceptors(FilesInterceptor('files', 10, SINGLE_OPTIONS))
    uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files?.length) throw new BadRequestException('Không tìm thấy file');
        return {
            urls: files.map(f => `/api/v1/uploads/files/${f.filename}`),
            files: files.map(f => ({
                url: `/api/v1/uploads/files/${f.filename}`,
                filename: f.filename,
                size: f.size,
            })),
        };
    }

    /** Serve uploaded file — public, no auth */
    @Get('files/:filename')
    serveFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(UPLOAD_DIR, filename);
        if (!existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        res.sendFile(filePath);
    }
}
