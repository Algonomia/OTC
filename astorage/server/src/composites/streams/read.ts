import { createReadStream, ReadStream } from 'fs';
import * as paths from "../common/paths";

export function getReadStream(uuid: string, option?: BufferEncoding): ReadStream {
    const filepath = paths.getPath(uuid);
    const stream = createReadStream(filepath, option || undefined);

    stream.on('error', (err: Error) => {
        console.error('Error reading file:', err);
        throw err;
    });
    
    return stream;
}
