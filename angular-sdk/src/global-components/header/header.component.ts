import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, TemplateRef} from '@angular/core';
import {NgTemplateOutlet, AsyncPipe} from '@angular/common';
import {ActivationEnd, Router, RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {debounceTime, filter, Observable, startWith} from 'rxjs';
import {AlgoIconComponent} from '../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {ATemplateComponent} from '../../templates/template-component.abstract';
import {ButtonGoBackComponent} from '../../design-elements/buttons/buttons/button-go-back/button-go-back.component';
import {GetLinkStrategyService, HeaderRoutes} from '../../global-services/get-link-strategy.service';
import {LangSelectorComponent} from '../lang-selector/lang-selector.component';
import {ScreenSizeHandlerComponent} from '../../plugs/screen-size-handler/screen-size-handler.component';
import {apparitionAnimations} from '../../css/animations';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    standalone: true,
    imports: [
        NgTemplateOutlet,
        AsyncPipe,
        RouterModule,
        TranslatePipe,
        ScreenSizeHandlerComponent,
        AlgoIconComponent,
        ButtonGoBackComponent,
        LangSelectorComponent,
    ],
    animations: apparitionAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent extends ATemplateComponent implements OnInit {
    @Input() getLinksCallback = GetLinkStrategyService.getAllHeaderTagged;
    @Input() isConnected$!: Observable<boolean>;
    @Input() extraBtnsRef!: TemplateRef<any>;
    @Input() logoRef!: TemplateRef<any>;

    __headerRoutes: HeaderRoutes[] = [];
    __currentRouteTitle: string = '';

    public show_menu_mobile: boolean = false;

    constructor(
        private _router: Router,
        private _cd: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this._router.events).pipe(
            filter(event => event instanceof ActivationEnd),
            startWith(null),
            debounceTime(100)
        ).subscribe(async () => {
            this._updateRoutes();
            this._updateCurrentRouteTitle();
        });
    }

    private _updateRoutes() {
        this.__headerRoutes = this.getLinksCallback(this._router);
        this._cd.markForCheck();
    }

    private _updateCurrentRouteTitle() {
        const urlTree = this._router.parseUrl(this._router.url);
        const urlTreeTitle = urlTree.root.children['primary']?.segments.map(s => s.path).join('/');
        const currentUrlPath = '/' + (urlTreeTitle ?? '');

        const matchedRoute = this.__headerRoutes.find(route =>
            currentUrlPath === '/' + route.path
        );

        this.__currentRouteTitle = matchedRoute?.title || '';
        this._cd.markForCheck();
    }
}
