import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {Knex} from 'knex';
import {
    TSourceView,
    sourceLinkCreateValidator,
    httpSourceProvenanceValidator,
    ESourceStatus,
    sourceMulterFileValidator,
    ZSourceViewSchema, THTTPCreateLinkSources, ZHttpCreateSourcesSchema, THTTPCreateFileSources,
    ZCreateLinkSourcesSchema
} from '@otc/domain';
import {Response} from 'express';
import {
    ArrayUtils,
    IFileMeta,
    IFileWithUUID,
    NullUndefinedUtils
} from '@algonomia/ts-shared';
import {FilesInterceptor} from '@nestjs/platform-express';
import {KnexDatabaseProvider} from '../../utils/database/knex';
import { PersistentStorageClient } from '@astorage/ts-client';
import {ProfileCompletionGuard} from '../../GUARDS/profile-completion.guard';
import {AuthGuard} from '../../GUARDS/auth.guard';
import {IsAdminGuard} from '../../GUARDS/is-admin.guard';
import {InternalOnlyGuard} from '../../GUARDS/internal-only.guard';
import {DBGetUser} from '../../auth/database/get';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {ZodValidationPipe} from '../../utils/validation/zod-validation.pipe';
import {AlgoValidatorsPipe} from '../../utils/validation/algo-validators.pipe';
import {SourceValidationService} from './database/source-validation/source-validation.service';
import {BDDSources, CreateSourceService} from './database/create-source/create-source.service';
import { CurrentUser } from '../../auth/decorators';
import { LoggedHttpException } from '../../utils/monitoring/errors/logged-http.exception';
import { FileMetaService } from '../../utils/files/file-meta.service';
import { ApiConsumes, ApiExcludeEndpoint, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetWithDoc, PostWithDoc, Schema } from '../../swagger/decorators';
import {FormDataIntFieldsPipe} from '../../utils/formData/form-data-int-fields.pipe';

@ApiTags('Sources')
@ApiSecurity('x-api-key')
@Controller('sources')
export class SourcesController {
    private readonly _database: Knex;

    constructor(
        private readonly _knexDatabaseProvider: KnexDatabaseProvider,
        private readonly _persistentStorageClient: PersistentStorageClient,
        private readonly _dbGetUser: DBGetUser,
        private readonly _createSourceService: CreateSourceService,
        private readonly _sourceValidation: SourceValidationService
    ) {
        this._database = this._knexDatabaseProvider.knex;
    }

    @Get('is_source_manager')
    @UseGuards(InternalOnlyGuard, AuthGuard)
    @ApiExcludeEndpoint()
    async getIsSourceManager(
        @CurrentUser('email') email: string,
        @Res() res: Response
    ): Promise<Response<boolean>> {
        try {
            const isAdmin = await this._dbGetUser.getIsUserAdmin(email);
            return res.status(HttpStatus.OK).json(isAdmin);
        }  catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, false);
        }
    }

    @GetWithDoc('all', {
        summary: 'Get all sources',
        response: { status: HttpStatus.OK, type: Schema('SourceView', ZSourceViewSchema), isArray: true, description: 'List of all source views' }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async getAll(@Res() res: Response): Promise<Response<TSourceView[]>> {
        const bddSources = await this._getSourceTable();
        return this._sendSource(bddSources, res);
    }

    @GetWithDoc('validated', {
        summary: 'Get only validated sources',
        response: { status: HttpStatus.OK, type: Schema('SourceView', ZSourceViewSchema), isArray: true, description: 'List of validated source views' }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async getValidatedSources(@Res() res: Response): Promise<Response<TSourceView[]>> {
        const bddSources = await this._getValidatedSourceTables();
        return this._sendSource(bddSources, res);
    }

    private async _getValidatedSourceTables(): Promise<BDDSources[]> {
        const all_sources = await this._getSourceTable();
        return all_sources.filter(x => this._sourceValidation.isSourceValidated(x.source_type, x.status));
    }

    private async _getSourceTable(): Promise<BDDSources[]> {
        const sources: BDDSources[] = await KnexDatabaseProvider.selectWithEnumCast(
            this._database, 'source', ['obligation_type_ids'], ['created_at', 'validated_at', 'date_of_publication']
        );
        return ArrayUtils.convertThenSort(sources, (x => x.created_at), -1);
    }

    private async _sendSource(bddSources: BDDSources[], res: Response) {
        if (!bddSources || bddSources.length === 0) {
            return res.status(HttpStatus.OK).json([]);
        }
        const sources = await this._convertBddSource(bddSources);
        return res.status(HttpStatus.OK).json(sources);
    }

    @PostWithDoc('files', {
        summary: 'Create a source with file attachments',
        response: { status: HttpStatus.OK, type: Number, isArray: true, description: 'Array of created source IDs' },
        body: { type: Schema('CreateFileSources', ZHttpCreateSourcesSchema), description: 'Source metadata (files are uploaded as multipart form-data field "files")' }
    })
    @UseInterceptors(FilesInterceptor('files'))
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    @ApiConsumes('multipart/form-data')
    async createFileSource(
        @Body(
            new FormDataIntFieldsPipe(['date_of_publication']),
            new ZodValidationPipe(ZHttpCreateSourcesSchema),
            new AlgoValidatorsPipe(httpSourceProvenanceValidator)
        ) body: THTTPCreateFileSources,
        @UploadedFiles(new AlgoValidatorsPipe(sourceMulterFileValidator)) multerFiles: Express.Multer.File[],
        @CurrentUser('email') email: string,
        @Res() res: Response
    ): Promise<Response<number[]>> {
        return res.status(HttpStatus.OK).json(await this._createSourceService.createFileSource(body, multerFiles, email));
    }

    @PostWithDoc('link', {
        summary: 'Create a source from a URL link',
        response: { status: HttpStatus.OK, type: Number, isArray: true, description: 'Array of created source IDs' },
        body: { type: Schema('CreateLinkSources', ZCreateLinkSourcesSchema) }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async createLinkSource(
        @Body(
            new ZodValidationPipe(ZCreateLinkSourcesSchema),
            new AlgoValidatorsPipe(sourceLinkCreateValidator)
        ) body: THTTPCreateLinkSources,
        @CurrentUser('email') email: string,
        @Res() res: Response
    ): Promise<Response<number[]>> {
        return res.status(HttpStatus.OK).json(await this._createSourceService.createLinkSource(body, email));
    }

    private async _convertBddSource(bddSources: BDDSources[]): Promise<TSourceView[]> {
        const fileUUIDs = bddSources.map(
            source => source.file_uuids
        ).flat().filter(x => !isNullOrUndefined(x)) as string[];
        const fileData: IFileMeta[] = await this._persistentStorageClient.getFileMetadata(fileUUIDs);
        const sortedFileData = ArrayUtils.convertThenSort(fileData, x => x.uuid);

        return bddSources.map(bddSource => {
            const files = FileMetaService.getFileDsFromFileUuids(bddSource.file_uuids ?? [], sortedFileData);
            return {
                source_id: bddSource?.id ?? -1,
                source_name: bddSource.source_name ?? '',
                organization: bddSource.organization ?? '',
                organization_type_id: bddSource.organization_type_id ?? undefined,
                date_of_publication: bddSource.date_of_publication?.getTime() ?? undefined,
                jurisdictions: bddSource.jurisdictions ?? [],
                obligation_type_ids: bddSource.obligation_type_ids ?? [],
                indicator_ids: bddSource.indicators ?? [],
                status_id: bddSource.status ?? undefined,
                proposed_by: bddSource.proposer_email ?? undefined,
                proposed_at: bddSource.created_at?.getTime() ?? undefined,
                validated_by: bddSource.validator_email ?? undefined,
                validated_at: bddSource.validated_at?.getTime() ?? undefined,
                source_type: bddSource.source_type ?? undefined,
                link: bddSource.link ? this._protectFromBadUrls(bddSource.link, bddSource.status) : undefined,
                comment: bddSource.comment ?? '',
                admin_comment: bddSource.admin_comment ?? '',
                files: files ? this._protectFromBadFiles(files, bddSource.status) : undefined
            };
        });
    }

    private _protectFromBadUrls(link: string, status: ESourceStatus) {
        if (status === ESourceStatus.RejectedUrl) {
            return 'UNSAFE LINK';
        } else if ([ESourceStatus.WaitForUrlMalwareScan, ESourceStatus.WaitForUrlSafeBrowsingCheck].includes(status)) {
            return 'WAITING FOR LINK SAFE CHECKS';
        }
        return link;
    }

    private _protectFromBadFiles(files: IFileWithUUID[], status: ESourceStatus): IFileWithUUID[] {
        if (files.length === 0) {
            return files;
        } else if (status === ESourceStatus.RejectedByMalwareScan) {
            return files.map(x => ({...x, uuid: '', name: 'REJECTED BY MALWARE SCAN'}));
        } else if (status === ESourceStatus.ScanForMalware) {
            return files.map(x => ({...x, uuid: '', name: 'WAITING FOR MALWARE SCAN'}));
        }
        return files;
    }

    @Post('validate')
    @UseGuards(InternalOnlyGuard, AuthGuard, IsAdminGuard)
    @ApiExcludeEndpoint()
    async validateSource(
        @Body() body: {id: number, comment: string},
        @Res() res: Response
    ): Promise<Response<boolean>> {
        if (!body?.id) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'No source provided',
            });
        }
        try {
            await this._sourceValidation.validateSource(body.id, body.comment);

            return res.status(HttpStatus.OK).json(true);
        } catch(error) {
            throw new LoggedHttpException(error, HttpStatus.INTERNAL_SERVER_ERROR, false);
        }
    }

    @Post('reject')
    @UseGuards(InternalOnlyGuard, AuthGuard, IsAdminGuard)
    @ApiExcludeEndpoint()
    async rejectSource(
        @Body() body: {id: number, comment: string},
        @Res() res: Response
    ): Promise<Response<boolean>> {
        if (!body?.id) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'No source provided',
            });
        }
        try {
            await this._sourceValidation.rejectSources([body.id], ESourceStatus.RejectedByAdmin, body.comment);
            return res.status(HttpStatus.OK).json(true);
        } catch(error) {
            throw new LoggedHttpException(error, HttpStatus.INTERNAL_SERVER_ERROR, false);
        }
    }
}
