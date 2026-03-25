import archiver from "archiver";
import {HIGH_WATER_MARK} from "./sizes";
import {access} from "fs/promises";

interface FileToZip {
    path: string;
    name: string;
}

export async function createZip(files: FileToZip[]): Promise<archiver.Archiver> {
    const zip = _createArchiver();

    for (const file of files) {
        await _addFileToArchiver(zip, file);
    }

    return zip;
}

function _createArchiver(): archiver.Archiver {
    const archive = archiver('zip', {
        zlib: {level: 6},
        highWaterMark: HIGH_WATER_MARK
    });

    archive.on('error', (err: Error) => {
        console.error('Archive error:', err);
        throw err;
    });

    return archive;
}

async function _addFileToArchiver(archive: archiver.Archiver, file: FileToZip): Promise<void> {
    try {
        await access(file.path);
        archive.file(file.path, {name: file.name});
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            console.warn(`File not found, skipping: ${file.path}`);
        } else {
            console.error('Error accessing file for zip:', e);
        }
    }
}
