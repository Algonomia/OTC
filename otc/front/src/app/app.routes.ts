import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {connectedGuard} from './sdk/global-services/connected.guard';
import {AboutComponent} from './pages/about/about.component';
import {SourcesComponent} from './pages/sources/sources.component';
import {DashboardsComponent} from './pages/dashboards/dashboards.component';
import {ContributionViewComponent} from './pages/contribution-view/contribution-view.component';
import {ApiAccessComponent} from './pages/api-access/api-access.component';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: HomeComponent,
                data: {
                    header: true,
                    headerTitle: 'OTCFront.Header.home',
                }
            },
            {
                path: 'dashboard',
                component: DashboardsComponent,
                canActivate: [connectedGuard],
                data: {
                    header: true,
                    headerTitle: 'OTCFront.Header.dashboard',
                    hasConnectionGuard: true
                }
            },
            {
                path: 'sources',
                component: SourcesComponent,
                canActivate: [connectedGuard],
                data: {
                    header: true,
                    headerTitle: 'OTCFront.Header.sources',
                    hasConnectionGuard: true
                }
            },
            {
                path: 'contributions',
                component: ContributionViewComponent,
                canActivate: [connectedGuard],
                data: {
                    header: true,
                    headerTitle: 'OTCFront.Header.contributions',
                    hasConnectionGuard: true
                }
            },
            {
                path: 'api-access',
                // redirectTo: '',
                component: ApiAccessComponent,
                canActivate: [connectedGuard],
                data: {
                    disabled: false,
                    header: true,
                    headerTitle: 'OTCFront.Header.APIAccess',
                    hasConnectionGuard: true
                }
            },
            {
                path: 'about',
                component: AboutComponent,
                data: {
                    header: true,
                    headerTitle: 'OTCFront.Header.about',
                }
            },
        ]
    }
];
