import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileUtils, IFile} from '@algonomia/ts-shared';
import {FileIconComponent} from '../file-icon/file-icon.component';
import {AlgoIconComponent} from '../../algo-icon/algo-icon/algo-icon.component';
import {FileSizePipe} from '../../../pipes/file-size.pipe';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-file-label',
    templateUrl: './file-label.component.html',
    styleUrl: './file-label.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        FileIconComponent,
        AlgoIconComponent,
        FileSizePipe,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileLabelComponent {
    @Output() callBack = new EventEmitter<void>();
    @Input() set file(file: File) {
        this.iFile = FileUtils.getIFile(file);
    }
    @Input() is_active: boolean = true;

    public iFile!: IFile;
}
