import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {AlgoIconWeightHandler, IconWeight} from '../algo-icon/weight-handler';
import {TranslatePipe} from '@ngx-translate/core';
import {NgClass, NgStyle} from '@angular/common';
import {IconHoverDirective} from '../algo-icon/algo-icon-hover/algo-icon-hover.directive';
import {AlgoIconComponent} from '../algo-icon/algo-icon/algo-icon.component';
import {TooltipModule} from 'primeng/tooltip';

export type Color_theme =
    | 'ref-color'
    | 'grey-0' | 'grey-0-color-7' | 'grey-1' | 'grey-2' | 'grey-9'
    | 'grey-1-outline' | 'grey-2-outline' | 'grey-6-hovered' | 'grey-7-outline' | 'grey-10-outline'
    | 'main-0' | 'main-1' | 'main-3' | 'main-3-outline' | 'main-3_color-grey-0'
    | 'ok-0' | 'ok-4' | 'ok-0-outline' | 'ok-3-outline'
    | 'ko-0' | 'ko-0-outline' | 'ko-3-outline'
    | 'yellow-1'
    | 'orange-3' | 'orange-3-outline'
    | 'link-0-outline' | 'link-2';

export type Border_theme = 'border-none' | 'border-1' | 'border-2';

export enum FontEnumId {
    Light, Normal, Regular, Medium, Bold,
}

export class FontEnum extends AEnhancedEnumFactory {
    static readonly light = new FontEnum(
        FontEnumId.Light, 'Integral UI ExtraLight', 'Light'
    );
    static readonly normal = new FontEnum(
        FontEnumId.Normal, 'Integral UI Light', 'Normal'
    );
    static readonly regular = new FontEnum(
        FontEnumId.Regular, 'Integral UI Regular', 'Regular'
    );
    static readonly medium = new FontEnum(
        FontEnumId.Medium, 'Integral UI Medium', 'Medium'
    );

    static getFont(weight: IconWeight): FontEnum {
        return (FontEnum.getByIdOrId(FontEnumId[weight]) as FontEnum | undefined) ?? FontEnum.regular;
    }

    private constructor(
        public readonly fontEnumId: FontEnumId,
        public readonly font_family: string,
        public readonly font_icon: IconWeight
    ) {
        super(fontEnumId);
    }
}

@Component({
    selector: 'app-label',
    templateUrl: './label.component.html',
    styleUrls: ['./label.component.scss'],
    standalone: true,
    imports: [
        TranslatePipe,
        NgClass,
        IconHoverDirective,
        NgStyle,
        TooltipModule,
        AlgoIconComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelComponent implements OnInit {
    // If you use something other than below templates in you components, bad things may happen. see example

    @ViewChild('Text', { static: true }) TextTemplate!: TemplateRef<{ text: string }>;
    @ViewChild('Id', { static: true }) IdTemplate!: TemplateRef<{ id: number }>;
    @ViewChild('Counter', { static: true }) CounterTemplate!: TemplateRef<{ counter: number, prefix?: string }>;
    @ViewChild('CounterHoverable', { static: true }) CounterHoverableTemplate!: TemplateRef<{ counter: number, prefix?: string }>;
    @ViewChild('AlgoIcon', { static: true }) AlgoIconTemplate!: TemplateRef<Partial<{ path: string, tooltip: string, icon_class: string, icon_color: string, callback: () => unknown, affect_text_on_hover: boolean }>>;
    @ViewChild('Image', { static: true }) ImageTemplate!: TemplateRef<{ icon_class: string, path: string }>;
    @ViewChild('Dot', { static: true }) DotTemplate!: TemplateRef<Partial<{tooltip: string}>>;
    @ViewChild('Symbol', { static: true }) SymbolTemplate!: TemplateRef<{ symbol: string }>;

    @Input() color_theme: Color_theme = 'main-3';
    @Input() border_theme: Border_theme = 'border-none';
    @Input() set font_theme(fontEnum: IconWeight) {
        this.weight_with_font = FontEnum.getFont(fontEnum);
        this.font_family = this.weight_with_font?.font_family ?? '';
        this.weight_font_theme = this.weight_with_font?.font_icon ?? 'Regular';
        this.__cd.markForCheck();
    };
    @Input() cursor_pointer = false;
    @Input() radius: string = '50px';
    @Input() font_hover = false;
    @Input() text_display_on_hover = false;
    @Input() all_icon_display_on_hover = false;
    @Input() set_open_label_element = false;
    @Input() set height(value: number) {
        const min_height = 24;
        const max_height = 34;

        if (value >= min_height && value <= max_height) {
            this._height = value;
        } else {
            this._height = min_height;
        }

        this.height_px = this._height + 'px';
        this.__cd.markForCheck();
    }

    get height(): number {
        return this._height;
    }

    public algoIconHandler?: AlgoIconWeightHandler;
    public weight_font_theme: IconWeight = 'Normal';
    public font_family: string = '';
    public height_px: string = '';
    private _height = 28;
    private weight_with_font?: FontEnum;

    constructor(public __cd: ChangeDetectorRef) {}

    ngOnInit() {
        if (this.font_hover) {
            this.algoIconHandler = new AlgoIconWeightHandler(this.weight_font_theme);
            this.__cd.markForCheck();
        }
    }

    launchCallback(event: any, callback?: () => unknown) {
        if (callback) {
            callback?.();
            event.stopPropagation();
        }
        this.__cd.markForCheck();
    }
}
