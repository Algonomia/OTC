import {Body, Controller, HttpStatus, Req, Res, UseGuards} from '@nestjs/common';
import {Response, Request} from 'express';
import { PersistentStorageClient } from '@astorage/ts-client';
import {ProfileCompletionGuard} from '../../GUARDS/profile-completion.guard';
import { ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetWithDoc, PostWithDoc, Schema } from '../../swagger/decorators';
import { ZDownloadFilesBody } from '@algonomia/ts-shared';

@ApiTags('Files')
@ApiSecurity('x-api-key')
@Controller('files')
export class FilesController {

    constructor(private _persistentStorageClient: PersistentStorageClient) {}

    @GetWithDoc('download', { summary: 'Download a single file by ID' })
    @UseGuards(ProfileCompletionGuard)
    @ApiQuery({ name: 'fileId', required: true, description: 'UUID of the file to download' })
    @ApiResponse({ status: HttpStatus.OK, description: 'File binary stream' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Missing fileId query parameter' })
    async downloadFile(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const { fileId } = req.query;
        if (!fileId) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'query parameter \'fileId\' is required',
            });
        }
        const response = await this._persistentStorageClient.downloadFile(fileId as string);
        res.setHeader('ContentType', response.headers['content-type']);
        res.setHeader('AccessControlExposeHeaders', 'ContentDisposition');
        res.setHeader('ContentDisposition', response.headers['content-disposition']);
        response.data.pipe(res);
    }

    @PostWithDoc('download', {
        summary: 'Download multiple files as a ZIP archive',
        body: { type: Schema('DownloadFilesBody', ZDownloadFilesBody) }
    })
    @UseGuards(ProfileCompletionGuard)
    @ApiResponse({ status: HttpStatus.OK, description: 'ZIP file binary stream' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or empty uuids array' })
    async downloadFiles(
        @Body() body: {uuids: string[]},
        @Res() res: Response
    ) {
        if (!body.uuids || !Array.isArray(body.uuids) || body.uuids.length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'uuids must be a nonempty array',
            });
        }
        const response = await this._persistentStorageClient.downloadZipFile(body.uuids);
        res.setHeader('ContentType', response.headers['content-type']);
        res.setHeader('ContentDisposition', response.headers['content-disposition']);
        response.data.pipe(res);
    }
}
