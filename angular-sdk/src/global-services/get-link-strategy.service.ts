import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';

export interface HeaderRoutes {
    path: string;
    title: string;
    disabled?: boolean;
    hasConnectionGuard?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class GetLinkStrategyService {
    static get getAllHeaderTagged() {
        return this._getAllHeaderTagged.bind(this);
    }

    private static _getAllHeaderTagged(router: Router): HeaderRoutes[] {
        const result: HeaderRoutes[] = [];

        const getTaggedRoutes = (routes: Route[], parentPath = '') => {
            routes.forEach(route => {
                const fullPath = this._nextPath(parentPath, route);

                if (route.data?.['header']) {
                    const headerRoute = {
                        path: fullPath,
                        title: route.data?.['headerTitle'] || fullPath,
                        disabled: route.data?.['disabled'],
                        hasConnectionGuard: route.data?.['hasConnectionGuard'],
                    }
                    result.push(headerRoute);
                }

                if (route.children) {
                    getTaggedRoutes(route.children, fullPath);
                }
            });

            return result;
        };

        return getTaggedRoutes(router.config);
    }

    private static _nextPath(parentPath: string, route: Route) {
        return [
            ...parentPath.split('/'),
            route.path
        ].filter(x => !!x).join('/');
    }
}
