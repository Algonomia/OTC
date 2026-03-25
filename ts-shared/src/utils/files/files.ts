import {NullUndefinedUtils} from '../null-undefined';
import {IFile} from '../../interface/file.interface';

export type FileUnits = 'GB' | 'MB' | 'KB' | '';

export namespace FileUtils {
    export const KB = 1024;
    export const MB = 1024 * KB;
    export const GB = 1024 * MB;

    export function getByteSize(unitSize: number, unit: FileUnits = ''): number {
        let multiplier = 1;
        switch (unit) {
            case 'GB': multiplier = GB; break;
            case 'MB': multiplier = MB; break;
            case 'KB': multiplier = KB; break;
        }
        return unitSize * multiplier;
    }

    export function getUnitSize(byteSize: number, unit: FileUnits = ''): number {
        let multiplier = 1;
        switch (unit) {
            case 'GB': multiplier = GB; break;
            case 'MB': multiplier = MB; break;
            case 'KB': multiplier = KB; break;
        }
        return byteSize / multiplier;
    }

    export function getIFile(file: File): IFile {
        return {
            name: file.name,
            extension: getExtensionFromFileName(file.name),
            size: file.size
        };
    }

    export function convertFileSize(bytes: number, decimals: number = 2): string {
        if (NullUndefinedUtils.isNullOrUndefined(bytes) || bytes === 0) {
            return '0 B';
        }

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const multiplier = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, multiplier)).toFixed(dm))} ${sizes[multiplier]}`;
    }

    export function getExtensionFromFileName(name: string): string {
        const match = name.match(/\.(\w+)$/);
        return match ? match[1] : '';
    }
}
