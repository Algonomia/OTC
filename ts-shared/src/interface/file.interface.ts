import {z} from 'zod';

export interface IFile {
    name: string;
    extension?: string;
    size?: number;
}

export interface IFileWithUUID extends IFile {
    uuid: string;
}

export interface IFileMeta extends IFileWithUUID {
    mimetype: string;
    malware_scan: string;
    upload_date: number;
    error?: string;
    additional_data: null;
}

export interface IDownloader<IFileExtended extends IFile> {
    download: (file: IFileExtended) => Promise<boolean>;
    downloadZip: (files: IFileExtended[]) => Promise<boolean>;
}

export const ZFileWithUuid: z.ZodType<IFileWithUUID> = z.object({
    uuid: z.string(),
    name: z.string(),
    extension: z.string().optional(),
    size: z.number().optional(),
});

export const ZDownloadFilesBody = z.object({
    uuids: z.array(z.string()),
});
