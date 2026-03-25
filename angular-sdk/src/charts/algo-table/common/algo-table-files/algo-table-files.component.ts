import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AlgoIconComponent} from '../../../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {IconHoverDirective} from '../../../../design-elements/algo-icon/algo-icon-hover/algo-icon-hover.directive';
import {TranslatePipe} from '@ngx-translate/core';
import {AlgoIconWeightHandler, IconWeight} from '../../../../design-elements/algo-icon/weight-handler';
import {Tooltip} from 'primeng/tooltip';
import {IFile, IDownloader} from '@algonomia/ts-shared';

@Component({
    selector: 'app-algo-table-files',
    imports: [
        AlgoIconComponent,
        IconHoverDirective,
        TranslatePipe,
        Tooltip
    ],
    templateUrl: './algo-table-files.component.html',
    styleUrl: './algo-table-files.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableFilesComponent<IFileExtended extends IFile> implements OnInit {
    @Input() set files(files: IFileExtended[]) {
        this.__files = files;
        this.__concatName = files?.map(x => x.name).join('\n\n') ?? '';
        this._cd.markForCheck();
    }
    @Input() downloader?: IDownloader<IFileExtended>;

    public algoIconHandler!: AlgoIconWeightHandler;
    public weightIcon: IconWeight = 'Normal';

    protected __files: IFileExtended[] = [];
    protected __concatName = '';

    constructor(private _cd: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.algoIconHandler = new AlgoIconWeightHandler(this.weightIcon, false);
    }

    async download() {
        try {
            if (this.__files.length === 1) {
                this.downloader?.download(this.__files[0]);
            } else if (this.__files.length > 1) {
                this.downloader?.downloadZip(this.__files);
            }
        } catch (error) {
            console.error(error)
        }
    }
}
