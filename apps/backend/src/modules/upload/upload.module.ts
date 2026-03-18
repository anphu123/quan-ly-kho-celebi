import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { GridFSService } from './gridfs.service';

@Module({
    controllers: [UploadController],
    providers: [GridFSService],
    exports: [GridFSService],
})
export class UploadModule { }
