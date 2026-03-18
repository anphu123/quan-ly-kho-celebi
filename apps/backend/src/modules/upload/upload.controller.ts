import {
    Controller, Post, UseInterceptors, UploadedFiles,
    UploadedFile, BadRequestException, UseGuards, Get, Param, Res,
    NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GridFSService } from './gridfs.service';

const multerMemory = {
    storage: memoryStorage(),
    fileFilter: (
        _req: any,
        file: Express.Multer.File,
        cb: (err: Error | null, accept: boolean) => void,
    ) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Chỉ chấp nhận file ảnh (jpg, png, webp)'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
};

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {
    constructor(private readonly gridfs: GridFSService) {}

    /** Upload single image → MongoDB GridFS */
    @Post('image')
    @ApiOperation({ summary: 'Upload single image, returns URL' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('file', multerMemory))
    async uploadSingle(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Không tìm thấy file');
        const id = await this.gridfs.uploadFile(file);
        return {
            url: `/api/v1/uploads/files/${id}`,
            filename: id,
            originalname: file.originalname,
            size: file.size,
        };
    }

    /** Upload multiple images (max 10) → MongoDB GridFS */
    @Post('images')
    @ApiOperation({ summary: 'Upload multiple images (max 10)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
        },
    })
    @UseInterceptors(FilesInterceptor('files', 10, multerMemory))
    async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files?.length) throw new BadRequestException('Không tìm thấy file');
        const ids = await Promise.all(files.map(f => this.gridfs.uploadFile(f)));
        return {
            urls: ids.map(id => `/api/v1/uploads/files/${id}`),
            files: ids.map((id, i) => ({
                url: `/api/v1/uploads/files/${id}`,
                filename: id,
                size: files[i].size,
            })),
        };
    }

    /** Serve file from GridFS — public, no auth */
    @Get('files/:id')
    async serveFile(@Param('id') id: string, @Res() res: Response) {
        try {
            const { stream, contentType } = await this.gridfs.downloadFile(id);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            stream.pipe(res);
        } catch (err: any) {
            if (err instanceof NotFoundException) {
                res.status(404).json({ message: 'File not found' });
            } else {
                throw new InternalServerErrorException('Lỗi đọc file');
            }
        }
    }
}
