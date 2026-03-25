import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input, OnInit,
} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {AlgoIconComponent} from '../algo-icon/algo-icon/algo-icon.component';
import {AlgoIconWeightHandler, IconWeight} from '../algo-icon/weight-handler';
import {IconHoverDirective} from '../algo-icon/algo-icon-hover/algo-icon-hover.directive';
import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {FontEnum, FontEnumId} from '../labels/label.component';

type ButtonGrey =
    | 'btn-grey-3d' | 'btn-grey-2-3d' | 'btn-grey-7-3d' | 'btn-grey-0' | 'btn-grey-1' | 'btn-grey-2' | 'btn-grey-3' | 'btn-grey-4' | 'btn-grey-5'| 'btn-grey-6'
    | 'btn-grey-7' | 'btn-grey-8' | 'btn-grey-9' | 'btn-grey-10' | 'btn-grey-0-outline' | 'btn-grey-5-outline' | 'btn-grey-7-outline' | 'btn-grey-10-outline';

type ButtonMain =
    | 'btn-main-4-3d' | 'btn-main-0' | 'btn-main-1' | 'btn-main-2' | 'btn-main-3' | 'btn-main-4' | 'btn-main-5' | 'btn-main-1-outline' | 'btn-main-3-outline' | 'btn-main-4-outline'| 'btn-main-5-outline';

type ButtonOk =
    | 'btn-ok-4-3d' | 'btn-ok-0' | 'btn-ok-1' | 'btn-ok-2' | 'btn-ok-3' | 'btn-ok-4' | 'btn-ok-5' | 'btn-ok-3-outline'| 'btn-ok-4-outline'| 'btn-ok-5-outline';

type ButtonKo =
    | 'btn-ko-4-3d' | 'btn-ko-0' | 'btn-ko-1' | 'btn-ko-2' | 'btn-ko-3' | 'btn-ko-4' | 'btn-ko-5' | 'btn-ko-3-outline'| 'btn-ko-4-outline'| 'btn-ko-5-outline';

type ButtonYellow =
    | 'btn-yellow-1' | 'btn-yellow-2' | 'btn-yellow-3' | 'btn-yellow-4' | 'btn-yellow-5';

type ButtonLink =
    | 'btn-link-0' | 'btn-link-4';

export type ButtonType =
    | ButtonGrey | ButtonMain | ButtonOk | ButtonKo | ButtonYellow | ButtonLink;

export type ButtonSizeType = 'Small' | 'Normal' | 'Regular' | 'Medium' | 'Large' | 'ExtraLarge';

export enum ButtonSizeThemeId {
    Small, Normal, Regular, Medium, Large, ExtraLarge
}

export class ButtonSizeTheme extends AEnhancedEnumFactory {
    static readonly small = new ButtonSizeTheme(
        ButtonSizeThemeId.Small, 30, 0.812
    );
    static readonly normal = new ButtonSizeTheme(
        ButtonSizeThemeId.Normal, 32, 0.875
    );
    static readonly regular = new ButtonSizeTheme(
        ButtonSizeThemeId.Regular, 36, 1
    );
    static readonly medium = new ButtonSizeTheme(
        ButtonSizeThemeId.Medium, 38, 1.12
    );
    static readonly large = new ButtonSizeTheme(
        ButtonSizeThemeId.Large, 50, 1.125
    );
    static readonly extraLarge = new ButtonSizeTheme(
        ButtonSizeThemeId.ExtraLarge, 50, 1.25
    );

    static getSize(weight: ButtonSizeType): ButtonSizeTheme {
        return (ButtonSizeTheme.getByIdOrId(ButtonSizeThemeId[weight]) as ButtonSizeTheme | undefined) ?? ButtonSizeTheme.normal;
    }

    private constructor(
        public readonly buttonSizeId: ButtonSizeThemeId,
        public readonly height: number,
        public readonly font_size_rem: number
    ) {
        super(buttonSizeId);
    }
}

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        AlgoIconComponent,
        IconHoverDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent implements OnInit {
    @Input() btnCssClass: ButtonType = 'btn-main-3';
    @Input() text!: string | undefined;
    @Input() textColor!: string;
    @Input() leftIcon!: string;
    @Input() rightIcon!: string;
    @Input() singleIcon!: string;
    @Input() rounded = false;
    @Input() disabled = false;
    @Input() label = '';
    @Input() full_width = false;
    @Input() set size_theme(fontEnum: ButtonSizeType) {
        this.height = ButtonSizeTheme.getSize(fontEnum)?.height ?? 32;
        this.font_size_rem = ButtonSizeTheme.getSize(fontEnum)?.font_size_rem ?? 0.875;
        this.cd.markForCheck();
    };
    public height: number = 28;
    public font_size_rem = 0.68;
    public weightIcon: IconWeight = 'Normal';
    public algoIconHandler!: AlgoIconWeightHandler;

    __height_px = '28px';

    constructor(public cd: ChangeDetectorRef) {}

    ngOnInit() {
        this.algoIconHandler = new AlgoIconWeightHandler(this.weightIcon, this.disabled);
        this.__height_px = this.height + 'px';
        this.cd.markForCheck();
    }
}
