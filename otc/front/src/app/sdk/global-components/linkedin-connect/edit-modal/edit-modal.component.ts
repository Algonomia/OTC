import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {ATemplateComponent, ButtonMainActionComponent, MetaFormGroupComponent, MetaFormGroup, ModalService} from '@algonomia/angular-sdk';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthLinkedinService} from '../../../global-services/auth.linkedin.service';
import {TUser, userUpdateFullValidatorGroup} from '@otc/domain';
import {filter, firstValueFrom} from 'rxjs';

@Component({
    selector: 'app-edit-modal',
    templateUrl: './edit-modal.component.html',
    styleUrl: './edit-modal.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        ButtonMainActionComponent,
        FormsModule,
        ReactiveFormsModule,
        MetaFormGroupComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditModalComponent extends ATemplateComponent {
    public userForm: MetaFormGroup | undefined;

    constructor(
        private _cd: ChangeDetectorRef,
        private _authLinkedinService: AuthLinkedinService,
        private _modalService: ModalService
    ) {
        super();
        firstValueFrom(
            this.pipeTakeUntil(this._authLinkedinService.getUserInfo$).pipe(filter(x => !!x))
        ).then((user: TUser) => {
            this.userForm = MetaFormGroup.createFromValidatorGroup(userUpdateFullValidatorGroup, {
                job: user.job,
                company: user.company,
                pro_email: user.pro_email,
                phone: user.phone
            });
            this._cd.markForCheck();
        });
    }

    onSubmit() {
        this._authLinkedinService.updateUserInfo({
            job: this.userForm?.value.job,
            company: this.userForm?.value.company,
            pro_email: this.userForm?.value.pro_email,
            phone: this.userForm?.value.phone
        });
        this._modalService.close();
    }
}
