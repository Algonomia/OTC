import { GlobalEnvironment } from '../environments/otc-env';

Object.assign(GlobalEnvironment, {
    production: false,
    apiUrl: 'http://localhost:3000/',
    siteUrl: 'http://localhost:4200',
    linkedinClientId: 'test-client-id',
    linkedinRedirectUri: 'http://localhost:3000/auth/linkedin/callback',
});
