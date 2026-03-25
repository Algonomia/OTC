import {ChangeDetectionStrategy, Component, Input, TemplateRef} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-accordion-item',
    imports: [
        TranslatePipe,
        NgTemplateOutlet
    ],
    templateUrl: './accordion-item.component.html',
    styleUrl: './accordion-item.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionItemComponent {
    @Input() lineTitle: string = '';
    @Input() itemTpl!: TemplateRef<any>;

    constructor() {}
}
