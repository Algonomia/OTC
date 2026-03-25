import {FileUnits, FileUtils} from '../../utils/files/files';
import {AValidator, BaseMeta} from '../validators.abstract';
import {EValidatorType} from '../EValidatorType';

export interface FileMeta extends BaseMeta {
    extensions?: string[];
    multiple?: boolean;
    maxSize?: number;
    maxSizeUnit?: FileUnits;
}

export abstract class AlgoFileValidator<TFile> extends AValidator<TFile[], FileMeta> {
    protected abstract __getName(f: TFile): string;
    protected abstract __getSize(f: TFile): number;

    readonly validator_type = EValidatorType.file;

    constructor(meta: FileMeta) {
        super(meta);
        if (meta.required) {
            this.errorCallbacks.push(this._filesRequired.bind(this));
        }
        if (meta.maxSize) {
            this.errorCallbacks.push(this._maxFileSize.bind(this, meta.maxSize, meta.maxSizeUnit));
        }
        if (meta.extensions?.length) {
            this.errorCallbacks.push(this._checkAllowedExtension.bind(this, meta.extensions));
        }
    }

    private _filesRequired(value?: TFile[]): null | {required: boolean} {
        if (!value || (Array.isArray(value) && value.length === 0)) return {
            required: true
        };
        return null
    }

    private _maxFileSize(maxSize: number, maxSizeUnit?: FileUnits, files?: TFile[]): { maxSizeExceeded: TFile[] } | null {
        if (!maxSize) {
            return null;
        }
        if (!files?.length) {
            return null;
        }
        const byteMaxSize = FileUtils.getByteSize(maxSize, maxSizeUnit);
        const bigFiles = files.filter(f => this.__getSize(f) > byteMaxSize);
        return !!bigFiles.length ? { maxSizeExceeded: bigFiles } : null;
    }

    private _checkAllowedExtension(extensions: string[], files?: TFile[]) {
        if (!extensions.length) {
            return null;
        }
        const accepts = (extensions ?? []).map(s => s.trim().toLowerCase());
        if (!files?.length) {
            return null;
        }

        const badFiles = files.filter(f => {
            const extension = FileUtils.getExtensionFromFileName(this.__getName(f));
            return !accepts.includes(extension);
        });

        return !!badFiles.length ? { forbiddenExtension: {badFiles: badFiles, allowedExtensions: extensions} } : null;
    }
}

export class AlgoBrowserFileValidator extends AlgoFileValidator<File> {
    protected __getName(f: File) {
        return f.name;
    }

    protected __getSize(f: File) {
        return f.size;
    }
}

export interface IMulterFile {
    originalname: string;
    size: number;
}

export class AlgoMulterFileValidator extends AlgoFileValidator<IMulterFile> {
    protected __getName(f: IMulterFile) {
        return f.originalname;
    }

    protected __getSize(f: IMulterFile) {
        return f.size;
    }
}
