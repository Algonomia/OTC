import { INestApplicationContext } from '@nestjs/common';

export class AppInjector {
    private static app: INestApplicationContext;

    static setApp(app: INestApplicationContext) {
        AppInjector.app = app;
    }

    static get<T>(token: any): T {
        if (!AppInjector.app) throw new Error('AppInjector not initialized');
        return AppInjector.app.get<T>(token);
    }
}
