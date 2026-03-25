import {Component, Input, TemplateRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';

export type QueryParamsType = {
    [key: string]: string | number | boolean | (string | number | boolean)[];
};

@Component({
    selector: 'app-href-handler',
    templateUrl: './href-handler.component.html',
    styleUrl: './href-handler.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
    ]
})
export class HrefHandlerComponent {
    @Input() link!: string;
    @Input() queryParams?: QueryParamsType;
    @Input() template!: TemplateRef<any>;
}
