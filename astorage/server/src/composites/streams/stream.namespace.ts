import { getReadStream } from './read';
import { sendToWriteStream } from './write';
import { deleteFile as deleteFileFunction } from './delete';

export namespace Stream {
    export const read = getReadStream;
    export const write = sendToWriteStream;    
    export const deleteFile = deleteFileFunction;
}

export {
    getReadStream,
    sendToWriteStream,
    deleteFileFunction as deleteFile
};

export type { ReadStream, WriteStream } from 'fs';
