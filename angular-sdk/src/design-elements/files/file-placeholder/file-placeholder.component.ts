import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {AlgoIconComponent} from '../../algo-icon/algo-icon/algo-icon.component';
import {TranslatePipe} from '@ngx-translate/core';
import {FileUnits, FileUtils, NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

@Component({
    selector: 'app-file-placeholder',
    templateUrl: './file-placeholder.component.html',
    styleUrl: './file-placeholder.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        AlgoIconComponent,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilePlaceholderComponent {
    @Input() multi_select: boolean = false;
    @Input() maxSize: number | undefined | null = null;
    @Input() maxSizeUnit?: FileUnits = '';
    @Input() required?: boolean = false;
    @Input() set allowed_extensions(allowed_extensions: string[] | undefined) {
        this.__allowedExtensions = allowed_extensions?.map(ext => '.' + ext).join(',') ?? '';
        this._cd.markForCheck();
    }
    @Input() placeholder?: string;
    @Output() filesEvent: EventEmitter<File[]> = new EventEmitter<File[]>();

    protected __allowedExtensions: string = '';

    constructor(private _cd: ChangeDetectorRef) {}

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files) {
            return;
        }

        const files: File[] = Array.from(input.files);
        if (this.checkMaxSizeExceeded(files)) {
            alert(`Max size is ${this.maxSize} ${this.maxSizeUnit}`);
            return;
        }

        this.filesEvent.emit(files);

        input.value = '';
    }

    checkMaxSizeExceeded(files: File[]) {
        if (isNullOrUndefined(this.maxSize) || this.maxSize! <= 0) {
            return false;
        }
        const maxByteSize = FileUtils.getByteSize(this.maxSize!, this.maxSizeUnit);
        return files.some(x => x.size > maxByteSize)
    }
}
