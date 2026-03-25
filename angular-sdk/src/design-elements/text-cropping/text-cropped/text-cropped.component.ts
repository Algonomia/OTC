import {
    ChangeDetectionStrategy,
    Component,
    computed, Input,
    input, signal
} from '@angular/core';
import {StringUtils} from '@algonomia/ts-shared';
import {TooltipModule} from 'primeng/tooltip';
import {NgClass} from '@angular/common';
import {ScreenSize, WidthHeightListenerService} from '../../../global-services/width-height-listener.service';
import {ATemplateComponent} from '../../../templates/template-component.abstract';

@Component({
    selector: 'app-text-cropped',
    imports: [
        TooltipModule,
        NgClass
    ],
    templateUrl: './text-cropped.component.html',
    styleUrl: './text-cropped.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextCroppedComponent extends ATemplateComponent {
    @Input() textClass ='';
    text = input<string | undefined | null>('');

    protected __normalizedText = computed(() => this.text() ?? '');
    protected __cropSize = signal(60);
    protected __cropped = computed(() =>
        StringUtils.cropTextMiddle(this.__normalizedText(), this.__cropSize())
    );

    constructor() {
        super();
        this.pipeTakeUntil(WidthHeightListenerService.windowScreenListener).subscribe(x => {
            if (x === ScreenSize.small) {
                this.__cropSize.set(45);
            } else {
                this.__cropSize.set(60);
            }
        });
    }
}
