import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CountryFlagComponent} from '@algonomia/angular-sdk';
import {TUser, UserUtils} from "@otc/domain";

@Component({
    selector: 'app-label-user',
    templateUrl: './label-user.component.html',
    styleUrl: './label-user.component.scss',
    imports: [CommonModule],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelUserComponent {
    @Input() set user(user: TUser) {
        this.__name = UserUtils.getUserFullName(user);
        this._cd.markForCheck();
    }

    __name: string = '';

    constructor(private _cd: ChangeDetectorRef) {}
}
