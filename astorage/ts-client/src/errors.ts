export class PersistentStorageMicroserviceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly details: unknown,
        public readonly serviceUrl: string,
    ) {
        super(message);
        this.name = 'PersistentStorageMicroserviceError';
    }
}

export class PersistentStorageNetworkError extends Error {
    constructor(message: string, public readonly serviceUrl: string) {
        super(message);
        this.name = 'PersistentStorageNetworkError';
    }
}
