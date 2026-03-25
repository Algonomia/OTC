export interface IApiAccessPublicInfo<D extends string | Date = string> {
    access_key: string,
    last_used_at?: D | null,
    expires_at: D,
    created_at: D,
}

export interface IApiAccessPublicInfoAndSecret<D extends string | Date = string> extends IApiAccessPublicInfo<D> {
    access_token: string
}

export type IBackApiAccessPublicInfo = IApiAccessPublicInfo<string>;
export type IBackApiAccessPublicInfoAndSecret = IApiAccessPublicInfoAndSecret<string>;
export type IFrontApiAccessPublicInfo = IApiAccessPublicInfo<Date>;
export type IFrontApiAccessPublicInfoAndSecret = IApiAccessPublicInfoAndSecret<Date>;

export interface ICreateAccessToken {
    expires_at: Date | null,
}
