import {ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenSizeHandlerComponent} from '../../plugs/screen-size-handler/screen-size-handler.component';
import {HrefHandlerComponent} from '../../plugs/href-handler/href-handler.component';

type LogoWeight = 'Light' | 'Regular' | 'Medium';

interface LogoPaths {
    logo: Record<LogoWeight, string>;
    wordmark: Record<LogoWeight, string>;
    short_wordmark: Record<LogoWeight, string>;
}

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrl: './logo.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ScreenSizeHandlerComponent,
        HrefHandlerComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent implements OnInit {
    @ViewChild('sharedLogoShort', { static: true }) sharedLogoShort!: TemplateRef<any>;
    @ViewChild('sharedLogo', { static: true }) sharedLogo!: TemplateRef<any>;
    @Input() logo_light: string = '';
    @Input() logo_regular: string = this.logo_light;
    @Input() logo_medium: string = this.logo_regular;
    @Input() wordmark_light: string = '';
    @Input() wordmark_regular: string = this.wordmark_light;
    @Input() wordmark_medium: string = this.wordmark_regular;
    @Input() short_wordmark_light: string = '';
    @Input() short_wordmark_regular: string = this.short_wordmark_light;
    @Input() short_wordmark_medium: string = this.short_wordmark_regular;

    public weight: LogoWeight = 'Medium';
    public logo_paths!: LogoPaths;

    constructor() {}

    ngOnInit() {
        this.logo_paths = {
            logo: {
                Light: this.logo_light,
                Regular: this.logo_regular,
                Medium: this.logo_medium,
            },
            wordmark: {
                Light: this.wordmark_light,
                Regular: this.wordmark_regular,
                Medium: this.wordmark_medium,
            },
            short_wordmark: {
                Light: this.short_wordmark_light,
                Regular: this.short_wordmark_regular,
                Medium: this.short_wordmark_medium,
            },
        }
    }
}
