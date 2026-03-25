import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileExtensions} from '@algonomia/ts-shared';

@Component({
    selector: 'app-file-icon',
    templateUrl: './file-icon.component.html',
    styleUrl: './file-icon.component.scss',
    standalone: true,
    imports: [
        CommonModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileIconComponent implements OnInit {
    @Input() extension!: string;
    @Input() size_icon: number = 32;

    public icon!: string;

    constructor() {}

    ngOnInit() {
        if (this.extension) {
            this.icon = FileExtensions.getIconByExtension(this.extension);
        }
    }
}
