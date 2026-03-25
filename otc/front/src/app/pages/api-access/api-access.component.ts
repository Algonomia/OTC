import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, OnInit,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {
    AlgoIconComponent,
    AlgoTableComponent,
    ATemplateWithResizablesComponent,
    ButtonMainActionComponent,
    ButtonRemoveComponent,
    ModalService,
    SelectHandler
} from '@algonomia/angular-sdk';
import {Observable} from 'rxjs';
import {AuthLinkedinService} from '../../sdk/global-services/auth.linkedin.service';
import {ApiAccessViewColumns} from './columns/view-api-access.columns';
import {GenerateKeyModalComponent} from './generate-key-modal/generate-key-modal.component';
import {AccessTokenFetcherService} from '../../Domain/access-token/access-token-fetcher.service';
import {IFrontApiAccessPublicInfo} from '@otc/domain';
import { GlobalEnvironment } from '../../../environments/otc-env';

@Component({
    selector: 'app-api-access',
    templateUrl: './api-access.component.html',
    styleUrl: './api-access.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        ButtonMainActionComponent,
        AlgoIconComponent,
        AlgoTableComponent,
        ButtonRemoveComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiAccessComponent extends ATemplateWithResizablesComponent implements OnInit {
    __isConnected$?: Observable<boolean>;

    public columns: any = ApiAccessViewColumns.getAllColumns();
    public selectHandler!: SelectHandler<IFrontApiAccessPublicInfo, string>;
    public readonly docApiUrl: string = `${GlobalEnvironment.apiUrl}api`;

    constructor(
        private _authService: AuthLinkedinService,
        private _modalService: ModalService,
        private _tokenService: AccessTokenFetcherService,
        private _cd: ChangeDetectorRef
    ) {
        super();
        this.__isConnected$ = this._authService.isConnected$;

        this.pipeTakeUntil(this._tokenService.tokens$).subscribe((data) => {
            this.selectHandler = SelectHandler.getMultiSelectHandler(data, [], this.selectHandler?.selected, (x => x.access_key));
            this._cd.markForCheck();
        });
    }

    ngOnInit() {
        this._tokenService.loadTokens();
    }

    public async removeSelection() {
        if (!this.selectHandler.selected || this.selectHandler.selected.length === 0) {
            return;
        }

        const selectedKeys = this.selectHandler.selected.map(item => item.access_key);

        try {
            await this._tokenService.removeTokens(selectedKeys);
        } catch (error) {
            console.error('Erreur lors de la suppression des tokens', error);
        }
    }

    public openGenerateKeyModal() {
        this._modalService.open(GenerateKeyModalComponent, 'small-full-height', {}, undefined, false);
    }
}
