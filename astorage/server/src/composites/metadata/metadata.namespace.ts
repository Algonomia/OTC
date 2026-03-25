import { createMetadata } from './create';
import { getAllMetadata, getMetadata } from './getters';
import { updateError, updateMalwareScan } from './update';

export namespace Metadata {
    export const create = createMetadata;

    export const getAll = getAllMetadata;
    export const get = getMetadata;

    export const setError = updateError;
    export const setScan = updateMalwareScan;
}

export {
    createMetadata,
    getAllMetadata,
    getMetadata,
    updateError,
    updateMalwareScan
};