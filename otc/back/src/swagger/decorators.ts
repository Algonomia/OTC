import { applyDecorators, Get, HttpStatus, Logger, Post, Type } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { ZodType } from 'zod';

type Primitive = typeof Boolean | typeof Number | typeof String;

interface NamedSchema {
    name: string;
    schema: ZodType;
}

interface DocResponseConfig {
    status: HttpStatus;
    type: NamedSchema | Primitive;
    isArray?: boolean;
    description?: string;
}

interface DocBodyConfig {
    type: NamedSchema;
    isArray?: boolean;
    description?: string;
}

interface DocGetConfig {
    summary: string;
    response?: DocResponseConfig;
}

interface DocPostConfig {
    summary: string;
    response?: DocResponseConfig;
    body: DocBodyConfig;
}

const cache = new Map<ZodType, Type>();
const logger = new Logger('SwaggerDoc');

export function Schema(name: string, schema: ZodType): NamedSchema {
    return { name, schema };
}

export function GetWithDoc(path: string, config: DocGetConfig): MethodDecorator {
    return _buildDecorators(Get, path, config);
}

export function PostWithDoc(path: string, config: DocPostConfig): MethodDecorator {
    const { name, schema } = config.body.type;
    const bodyType = _getOrCreateDto(name, schema);

    return _buildDecorators(Post, path, config, [
        ApiBody({
            type: config.body.isArray ? [bodyType] : bodyType,
            ...(config.body.description && { description: config.body.description }),
        }),
    ]);
}

function _buildDecorators(
    method: typeof Get | typeof Post,
    path: string,
    config: { summary: string; response?: DocResponseConfig },
    extra: (MethodDecorator | ClassDecorator)[] = []
): MethodDecorator {
    const decorators: (MethodDecorator | ClassDecorator)[] = [
        method(path),
        ApiOperation({ summary: config.summary }),
    ];

    if (config.response) {
        const { status, type } = config.response;
        const resolved = typeof type === 'function' ? type : _getOrCreateDto(type.name, type.schema);
        decorators.push(ApiResponse({
            status: status,
            type: config.response.isArray ? [resolved] : resolved,
            ...(config.response.description && { description: config.response.description }),
        }));
    }

    decorators.push(...extra);

    return applyDecorators(...decorators);
}

function _getOrCreateDto(name: string, schema: ZodType): Type {
    const existing = cache.get(schema);
    if (existing) {
        if (existing.name !== name) {
            logger.warn(`Schema registered as '${existing.name}' is also used as '${name}' — keeping '${existing.name}'`);
        }
        return existing;
    }
    const dto = createZodDto(schema);
    Object.defineProperty(dto, 'name', { value: name, writable: false });
    cache.set(schema, dto);
    return dto;
}