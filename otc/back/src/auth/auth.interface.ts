export abstract class AuthProvider {
    abstract getAccessToken(code: string): Promise<any>;
    abstract getUserInfo(accessToken: string): Promise<any>;
}