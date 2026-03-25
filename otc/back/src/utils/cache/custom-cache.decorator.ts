import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppInjector } from '../../app.injector';
import {NullUndefinedUtils, TimeUtils, TimeUnit} from '@algonomia/ts-shared';
import isNotNullOrUndefined = NullUndefinedUtils.isNotNullOrUndefined;

type CacheOptions<T extends any[]> = {
    baseKey: string;
    ttl?: number;
    ttlUnit?: TimeUnit;
    keyBuilder: (...args: T) => string;
};

const _usedBaseKeys = new Set<string>();

export function CustomCache<T extends any[]>(options: CacheOptions<T>) {
    if (_usedBaseKeys.has(options.baseKey)) {
        throw new Error(`Duplicate cache baseKey detected: "${options.baseKey}"`);
    }
    _usedBaseKeys.add(options.baseKey);

    return (
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: T) => Promise<any>>,
    ) => {
        const originalMethod = descriptor.value!;

        descriptor.value = async function (...args: T) {
            const cache = AppInjector.get<Cache>(CACHE_MANAGER);
            if (!cache) {
                return originalMethod.apply(this, args);
            }

            const dynamicKey = _buildDynamicKey(options.keyBuilder, ...args);
            const key = _mergeKeys(options.baseKey, dynamicKey);

            const cached = await cache.get<unknown>(key);
            if (cached !== undefined) {
                return cached;
            }

            const result = originalMethod.apply(this, args);
            const resolved = result instanceof Promise ? await result : result;

            const ttl = TimeUtils.toMs(options.ttl, options.ttlUnit);
            await cache.set(key, resolved, ttl);

            return result;
        };

        return descriptor;
    };
}

function _buildDynamicKey(keyBuilder?: Function, ...args: any[]) {
    if (keyBuilder) {
        return keyBuilder(...args);
    }
    return '';
}

function _mergeKeys(...keys: any[]) {
    return keys.filter(isNotNullOrUndefined).map(x => JSON.stringify(x)).join(' :$: ');
}
