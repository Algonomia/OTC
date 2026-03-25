import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef} from '@angular/core';
import {ATemplateComponent} from '../../templates/template-component.abstract';
import {ScreenSize, WidthHeightListenerService} from '../../global-services/width-height-listener.service';
import {NgSwitch, NgSwitchCase, NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-screen-size-handler',
    imports: [
        NgSwitch,
        NgSwitchCase,
        NgTemplateOutlet
    ],
    templateUrl: './screen-size-handler.component.html',
    styleUrl: './screen-size-handler.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenSizeHandlerComponent extends ATemplateComponent {
    @Input() appSmallTemplate?: TemplateRef<any>;
    @Input() appIntermediaryTemplate?: TemplateRef<any>;
    @Input() appNormalTemplate!: TemplateRef<any>;
    screenSizeEnum = ScreenSize;
    screenSize: ScreenSize = ScreenSize.normal;

    constructor(private _cdr: ChangeDetectorRef) {
        super();
        this.pipeTakeUntil(WidthHeightListenerService.windowScreenListener).subscribe(x => {
            this.screenSize = x;
            this._cdr.markForCheck();
        });
    }
}

