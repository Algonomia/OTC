import {unlink} from 'fs/promises';
import {getPath} from '../common/paths';

export async function deleteFile(uuid: string): Promise<void> {
    const filepath = getPath(uuid);
    try {
        await unlink(filepath);
    } catch(e: any) {
        if (e.code === 'ENOENT') { // File does not exist
            return;
        }
        console.error(e);
        throw e;
    }
}
