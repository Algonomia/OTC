import {CanActivateFn, Router} from '@angular/router';
import {AuthLinkedinService} from './auth.linkedin.service';
import {AppInjector} from '../../injector';
import { map } from 'rxjs';

export const connectedGuard: CanActivateFn = (route, state) => {
    const authService = AppInjector.get(AuthLinkedinService);
    const router = AppInjector.get(Router);

    return authService.isConnected$.pipe(
        map(isAuthenticated => {
            if (isAuthenticated) {
                return true;
            } else {
                router.navigate(['/']);
                return false;
            }
        })
    );
};
