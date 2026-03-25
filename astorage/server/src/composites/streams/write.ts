import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import path from 'path';
import {getPath} from '../common/paths';
import {CHUNK_SIZE} from '../common/sizes';

export function sendToWriteStream(uuid: string, content: Buffer): Promise<void> {
    const filepath = getPath(uuid);
    return new Promise((resolve, reject) => {
        try {
            _createDirIfNotExist(filepath);
            const stream = _createWriteStream(filepath, resolve, reject);
            stream.write(content);
            stream.end();
        } catch(e: any) {
            console.error('Error in createFile:', e);
            reject(e);
        }
    });
}

function _createDirIfNotExist(filepath: string): void {
    const dirname = path.dirname(filepath);
    if (!existsSync(dirname)) {
        mkdirSync(dirname, { recursive: true });
    }
}

function _createWriteStream(filepath: string, resolve: () => void, reject: (error: any) => void): WriteStream {
    const stream = createWriteStream(filepath, { highWaterMark: CHUNK_SIZE });

    stream.on('error', (err: Error) => {
        console.error('Write stream error:', err);
        reject(err);
    });

    stream.on('finish', () => {
        console.log(`File written successfully: ${filepath}`);
        resolve();
    });

    return stream;
}
