export function AuditTime<T extends any[]>() {
    return (
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: T) => Promise<any>>,
    ) => {
        const originalMethod = descriptor.value!;

        descriptor.value = async function (...args: T) {
            const d1 = new Date().getTime();

            const result = await originalMethod.apply(this, args);
            const resolved = result instanceof Promise ? await result : result;

            const d2 = new Date().getTime();
            console.log(propertyKey, d2 - d1, 'ms');
            return result;
        };

        return descriptor;
    };
}
