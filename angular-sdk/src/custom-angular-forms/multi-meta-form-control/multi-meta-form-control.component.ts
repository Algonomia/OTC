import {ChangeDetectionStrategy, Component, forwardRef, Input} from '@angular/core';
import {MetaFormControlComponent} from '../meta-form-control/meta-form-control.component';
import {MetaFormControl} from '../metaforms';
import {apparitionAnimations} from '../../css/animations';

@Component({
    selector: 'app-multi-meta-form-control',
    imports: [
        forwardRef(() => MetaFormControlComponent)
    ],
    templateUrl: './multi-meta-form-control.component.html',
    styleUrl: './multi-meta-form-control.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: apparitionAnimations
})
export class MultiMetaFormControlComponent {
    @Input() metaFormControls: MetaFormControl<any, any>[] = [];
    @Input() hide_optionals: boolean = false;
}
