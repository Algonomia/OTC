export function PreventConcurrency(): MethodDecorator {
    return function (
        _target: object,
        _key: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const original = descriptor.value as (...args: any[]) => Promise<any>;
        let isRunning = false;

        descriptor.value = async function () {
            if (isRunning) return [];
            isRunning = true;
            try {
                return await original.apply(this);
            } finally {
                isRunning = false;
            }
        };

        return descriptor;
    };
}
