import {ABackToFrontDTO} from '@algonomia/ts-shared';
import {z} from 'zod';
import {
    IBackApiAccessPublicInfo,
    IBackApiAccessPublicInfoAndSecret,
    IFrontApiAccessPublicInfo, IFrontApiAccessPublicInfoAndSecret
} from './access-token.interface';
import {ZApiAccessPublicInfoAndSecretSchema, ZApiAccessPublicInfoSchema} from './zod';

export class AccessTokenDTO extends ABackToFrontDTO<IBackApiAccessPublicInfo, IFrontApiAccessPublicInfo, z.ZodType<IBackApiAccessPublicInfo>>{
    readonly uri: string = 'access_token';
    protected __schema = ZApiAccessPublicInfoSchema;

    protected __toFront(apiAccessPublicInfo: IBackApiAccessPublicInfo[]) {
        return apiAccessPublicInfo.map(x => this._toFront(x));
    }

    private _toFront(apiAccessPublicInfo: IBackApiAccessPublicInfo): IFrontApiAccessPublicInfo {
        return {
            access_key: apiAccessPublicInfo.access_key,
            last_used_at: apiAccessPublicInfo.last_used_at ? new Date(apiAccessPublicInfo.last_used_at) : undefined,
            expires_at: new Date(apiAccessPublicInfo.expires_at)!,
            created_at: new Date(apiAccessPublicInfo.created_at)!,
        }
    }
}

export class AccessTokenAndSecretDTO extends ABackToFrontDTO<IBackApiAccessPublicInfoAndSecret, IFrontApiAccessPublicInfoAndSecret, z.ZodType<IBackApiAccessPublicInfoAndSecret>>{
    readonly uri: string = 'access_token';
    protected __schema = ZApiAccessPublicInfoAndSecretSchema;

    protected __toFront(apiAccessPublicInfo: IBackApiAccessPublicInfoAndSecret[]) {
        return apiAccessPublicInfo.map(x => this._toFront(x));
    }

    private _toFront(apiAccessPublicInfo: IBackApiAccessPublicInfoAndSecret): IFrontApiAccessPublicInfoAndSecret {
        return {
            access_key: apiAccessPublicInfo.access_key,
            access_token: apiAccessPublicInfo.access_token,
            last_used_at: apiAccessPublicInfo.last_used_at ? new Date(apiAccessPublicInfo.last_used_at) : undefined,
            expires_at: new Date(apiAccessPublicInfo.expires_at)!,
            created_at: new Date(apiAccessPublicInfo.created_at)!,
        }
    }
}
