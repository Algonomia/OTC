import { FileUtils } from "@algonomia/ts-shared";

export const CHUNK_SIZE = 1 * FileUtils.MB; // 1MB chunk size for optimal performance

const threshold = parseInt(process.env.LARGE_FILE_THRESHOLD || '100');
export const LARGE_FILE_THRESHOLD = threshold * FileUtils.MB; // Threshold for large files

export const HIGH_WATER_MARK = 4 * FileUtils.MB;