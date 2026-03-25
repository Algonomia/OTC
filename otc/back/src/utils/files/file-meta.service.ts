import { Injectable } from "@nestjs/common";
import { ArrayUtils, IFileMeta, IFileWithUUID } from "@algonomia/ts-shared";

@Injectable()
export class FileMetaService {

    constructor() {}

    public static getAggregatedMalwareScan(files: IFileMeta[]): 'PENDING' | 'CLEAN' | 'INFECTED' {
        let malwareScan: 'PENDING' | 'CLEAN' | 'INFECTED' = 'PENDING';
        if (files.some(x => x.malware_scan === 'INFECTED')) {
            malwareScan = 'INFECTED'
        } else if (files.every(x => x.malware_scan === 'CLEAN')) {
            malwareScan = 'CLEAN';  
        }
        return malwareScan;
    }

    public static getFileDsFromFileUuids(file_uuids: string[], sortedFileData: IFileMeta[]) {
        const files: IFileWithUUID[] = [];
        file_uuids.forEach(uuid => {
            const fileD = ArrayUtils.findWithBinarySearch(sortedFileData, uuid, (x, y) => ArrayUtils.STANDARD_GENERAL_COMPARATOR(x.uuid, y));
            if (!!fileD) {
                files.push({uuid: fileD.uuid, name: fileD.name, size: fileD.size, extension: fileD.extension});
            }
        });
        return files;
    }

    public static getFilesMetaFileUuids(fileUuids: string[], sourceFilesMeta: IFileMeta[]) {
        const filesMeta: IFileMeta[] = [];
        fileUuids.forEach(uuid => {
            const fileData = ArrayUtils.findWithBinarySearch(sourceFilesMeta, uuid, (x, y) => ArrayUtils.STANDARD_GENERAL_COMPARATOR(x.uuid, y));
            if (fileData) {
                filesMeta.push(fileData);
            }
        });
        return filesMeta;
    }
}