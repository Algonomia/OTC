export const sqlLitePath = process.env.SQLITE_FILE_PATH || 'data/sqlite.db';
export const fileStoragePath = process.env.FILE_STORAGE_PATH || 'data/media';

export function getPath(uuid: string) {
    return `${fileStoragePath}/${uuid}`;
}
