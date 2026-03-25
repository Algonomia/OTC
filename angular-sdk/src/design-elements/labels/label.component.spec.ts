import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelComponent, Color_theme, FontEnum } from './label.component';
import { TranslateModule } from '@ngx-translate/core';
import {NO_ERRORS_SCHEMA, Type} from '@angular/core';
import { AlgoIconWeightHandler, IconWeight } from '../algo-icon/weight-handler';

describe('LabelComponent', () => {
    let component: LabelComponent;
    let fixture: ComponentFixture<LabelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            expect(component.color_theme).toBe('main-3');
            expect(component.border_theme).toBe('border-none');
            expect(component.cursor_pointer).toBe(false);
            expect(component.radius).toBe('50px');
            expect(component.font_hover).toBe(false);
            expect(component.text_display_on_hover).toBe(false);
            expect(component.all_icon_display_on_hover).toBe(false);
            expect(component.set_open_label_element).toBe(false);
            expect(component.height).toBe(28);
        });

        it('should set weight_font_theme to Normal by default', () => {
            expect(component.weight_font_theme).toBe('Normal');
        });

        it('should initialize algoIconHandler when font_hover is true', () => {
            component.font_hover = true;
            component.ngOnInit();
            expect(component.algoIconHandler).toBeDefined();
            expect(component.algoIconHandler).toBeInstanceOf(AlgoIconWeightHandler);
        });

        it('should not initialize algoIconHandler when font_hover is false', () => {
            component.font_hover = false;
            component.ngOnInit();
            expect(component.algoIconHandler).toBeUndefined();
        });

        it('should mark for check after initialization with font_hover', () => {
            const changeDetectorRef = component.__cd;
            spyOn(changeDetectorRef, 'markForCheck');

            component.font_hover = true;
            component.ngOnInit();

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });

    describe('Height property', () => {
        it('should accept valid height within range (24-34)', () => {
            component.height = 30;
            expect(component.height).toBe(30);
            expect(component.height_px).toBe('30px');
        });

        it('should set minimum height when value is below 24', () => {
            component.height = 20;
            expect(component.height).toBe(24);
            expect(component.height_px).toBe('24px');
        });

        it('should set minimum height when value is above 34', () => {
            component.height = 40;
            expect(component.height).toBe(24);
            expect(component.height_px).toBe('24px');
        });

        it('should mark for check when height changes', () => {
            const changeDetectorRef = component.__cd;
            spyOn(changeDetectorRef, 'markForCheck');

            component.height = 30;

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });

    describe('Font theme property', () => {
        it('should set font theme to Light', () => {
            component.font_theme = 'Light';
            expect(component.weight_font_theme).toBe('Light');
            expect(component.font_family).toBe('Integral UI ExtraLight');
        });

        it('should set font theme to Normal', () => {
            component.font_theme = 'Normal';
            expect(component.weight_font_theme).toBe('Normal');
            expect(component.font_family).toBe('Integral UI Light');
        });

        it('should set font theme to Regular', () => {
            component.font_theme = 'Regular';
            expect(component.weight_font_theme).toBe('Regular');
            expect(component.font_family).toBe('Integral UI Regular');
        });

        it('should set font theme to Medium', () => {
            component.font_theme = 'Medium';
            expect(component.weight_font_theme).toBe('Medium');
            expect(component.font_family).toBe('Integral UI Medium');
        });

        it('should mark for check when font theme changes', () => {
            const changeDetectorRef = component.__cd;
            spyOn(changeDetectorRef, 'markForCheck');

            component.font_theme = 'Medium';
            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });

    describe('Color themes', () => {
        const colorThemes: Color_theme[] = [
            'ref-color',
            'grey-0', 'grey-0-color-7', 'grey-1', 'grey-2', 'grey-9',
            'grey-1-outline', 'grey-2-outline', 'grey-6-hovered', 'grey-10-outline',
            'main-0', 'main-1', 'main-3', 'main-3-outline', 'main-3_color-grey-0',
            'ok-0', 'ok-4', 'ok-0-outline', 'ok-3-outline',
            'ko-0', 'ko-0-outline', 'ko-3-outline',
            'yellow-1',
            'orange-3', 'orange-3-outline',
            'link-0-outline', 'link-2'
        ];

        colorThemes.forEach(theme => {
            it(`should accept color theme: ${theme}`, () => {
                component.color_theme = theme;
                expect(component.color_theme).toBe(theme);
            });
        });
    });

    describe('Border themes', () => {
        it('should accept border-none theme', () => {
            component.border_theme = 'border-none';
            expect(component.border_theme).toBe('border-none');
        });

        it('should accept border-1 theme', () => {
            component.border_theme = 'border-1';
            expect(component.border_theme).toBe('border-1');
        });

        it('should accept border-2 theme', () => {
            component.border_theme = 'border-2';
            expect(component.border_theme).toBe('border-2');
        });
    });

    describe('launchCallback method', () => {
        it('should call callback when provided', () => {
            const mockCallback = jasmine.createSpy('callback');
            const event = new Event('click');
            spyOn(event, 'stopPropagation');

            component.launchCallback(event, mockCallback);

            expect(mockCallback).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
        });

        it('should not throw error when callback is undefined', () => {
            const event = new Event('click');

            expect(() => {
                component.launchCallback(event, undefined);
            }).not.toThrow();
        });

        it('should not call stopPropagation when callback is undefined', () => {
            const event = new Event('click');
            spyOn(event, 'stopPropagation');

            component.launchCallback(event, undefined);
            expect(event.stopPropagation).not.toHaveBeenCalled();
        });

        it('should mark for check after callback execution', () => {
            const mockCallback = jasmine.createSpy('callback');
            const event = new Event('click');
            const changeDetectorRef = component.__cd;
            spyOn(changeDetectorRef, 'markForCheck');

            component.launchCallback(event, mockCallback);

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should execute callback with correct context', () => {
            let executedValue = '';
            const callback = () => {
                executedValue = 'executed';
            };
            const event = new Event('click');

            component.launchCallback(event, callback);
            expect(executedValue).toBe('executed');
        });

        it('should stop event propagation before marking for check', () => {
            const mockCallback = jasmine.createSpy('callback');
            const event = new Event('click');
            const changeDetectorRef = component.__cd;

            let stopPropagationCalled = false;
            let markForCheckCalled = false;

            spyOn(event, 'stopPropagation').and.callFake(() => {
                stopPropagationCalled = true;
                expect(markForCheckCalled).toBe(false);
            });

            spyOn(changeDetectorRef, 'markForCheck').and.callFake(() => {
                markForCheckCalled = true;
                expect(stopPropagationCalled).toBe(true);
            });

            component.launchCallback(event, mockCallback);

            expect(stopPropagationCalled).toBe(true);
            expect(markForCheckCalled).toBe(true);
        });
    });

    describe('ViewChild templates', () => {
        it('should have Text template defined', () => {
            expect(component.TextTemplate).toBeDefined();
        });

        it('should have Id template defined', () => {
            expect(component.IdTemplate).toBeDefined();
        });

        it('should have Counter template defined', () => {
            expect(component.CounterTemplate).toBeDefined();
        });

        it('should have CounterHoverable template defined', () => {
            expect(component.CounterHoverableTemplate).toBeDefined();
        });

        it('should have AlgoIcon template defined', () => {
            expect(component.AlgoIconTemplate).toBeDefined();
        });

        it('should have Image template defined', () => {
            expect(component.ImageTemplate).toBeDefined();
        });

        it('should have Dot template defined', () => {
            expect(component.DotTemplate).toBeDefined();
        });
    });

    describe('FontEnum static methods', () => {
        it('should get Light font by weight', () => {
            const font = FontEnum.getFont('Light');

            expect(font).toBeDefined();
            expect(font.font_family).toBe('Integral UI ExtraLight');
            expect(font.font_icon).toBe('Light');
        });

        it('should get Normal font by weight', () => {
            const font = FontEnum.getFont('Normal');

            expect(font).toBeDefined();
            expect(font.font_family).toBe('Integral UI Light');
            expect(font.font_icon).toBe('Normal');
        });

        it('should get Regular font by weight', () => {
            const font = FontEnum.getFont('Regular');

            expect(font).toBeDefined();
            expect(font.font_family).toBe('Integral UI Regular');
            expect(font.font_icon).toBe('Regular');
        });

        it('should get Medium font by weight', () => {
            const font = FontEnum.getFont('Medium');

            expect(font).toBeDefined();
            expect(font.font_family).toBe('Integral UI Medium');
            expect(font.font_icon).toBe('Medium');
        });

        it('should return regular font as fallback for unknown weight', () => {
            const font = FontEnum.getFont('Unknown' as IconWeight);

            expect(font).toBeDefined();
            expect(font.font_family).toBe('Integral UI Regular');
        });
    });

    describe('Input properties integration', () => {
        it('should handle multiple property changes together', () => {
            component.color_theme = 'ok-0';
            component.border_theme = 'border-2';
            component.cursor_pointer = true;
            component.radius = '10px';
            component.height = 30;

            expect(component.color_theme).toBe('ok-0');
            expect(component.border_theme).toBe('border-2');
            expect(component.cursor_pointer).toBe(true);
            expect(component.radius).toBe('10px');
            expect(component.height).toBe(30);
        });

        it('should handle font and height changes together', () => {
            component.font_theme = 'Medium';
            component.height = 32;

            expect(component.weight_font_theme).toBe('Medium');
            expect(component.font_family).toBe('Integral UI Medium');
            expect(component.height).toBe(32);
            expect(component.height_px).toBe('32px');
        });
    });

    describe('Edge cases', () => {
        it('should handle zero height', () => {
            component.height = 0;
            expect(component.height).toBe(24);
            expect(component.height_px).toBe('24px');
        });

        it('should handle negative height', () => {
            component.height = -10;
            expect(component.height).toBe(24);
            expect(component.height_px).toBe('24px');
        });

        it('should handle very large height', () => {
            component.height = 1000;
            expect(component.height).toBe(24);
            expect(component.height_px).toBe('24px');
        });

        it('should handle callback that throws error', () => {
            const errorCallback = () => {
                throw new Error('Callback error');
            };
            const event = new Event('click');

            expect(() => {
                component.launchCallback(event, errorCallback);
            }).toThrow();
        });

        it('should handle empty radius string', () => {
            component.radius = '';
            expect(component.radius).toBe('');
        });

        it('should handle radius with different units', () => {
            component.radius = '10%';
            expect(component.radius).toBe('10%');

            component.radius = '5rem';
            expect(component.radius).toBe('5rem');
        });
    });

    describe('Boolean input properties', () => {
        it('should toggle cursor_pointer', () => {
            expect(component.cursor_pointer).toBe(false);

            component.cursor_pointer = true;
            expect(component.cursor_pointer).toBe(true);

            component.cursor_pointer = false;
            expect(component.cursor_pointer).toBe(false);
        });

        it('should toggle font_hover', () => {
            expect(component.font_hover).toBe(false);

            component.font_hover = true;
            expect(component.font_hover).toBe(true);

            component.font_hover = false;
            expect(component.font_hover).toBe(false);
        });

        it('should toggle text_display_on_hover', () => {
            expect(component.text_display_on_hover).toBe(false);

            component.text_display_on_hover = true;
            expect(component.text_display_on_hover).toBe(true);

            component.text_display_on_hover = false;
            expect(component.text_display_on_hover).toBe(false);
        });

        it('should toggle all_icon_display_on_hover', () => {
            expect(component.all_icon_display_on_hover).toBe(false);

            component.all_icon_display_on_hover = true;
            expect(component.all_icon_display_on_hover).toBe(true);

            component.all_icon_display_on_hover = false;
            expect(component.all_icon_display_on_hover).toBe(false);
        });

        it('should toggle set_open_label_element', () => {
            expect(component.set_open_label_element).toBe(false);

            component.set_open_label_element = true;
            expect(component.set_open_label_element).toBe(true);

            component.set_open_label_element = false;
            expect(component.set_open_label_element).toBe(false);
        });
    });

    describe('AlgoIconWeightHandler initialization', () => {
        it('should create handler with correct weight when font_hover is enabled', () => {
            component.font_theme = 'Medium';
            component.font_hover = true;
            component.ngOnInit();

            expect(component.algoIconHandler).toBeDefined();
            expect(component.algoIconHandler?.activeWeight).toBe('Medium');
        });

        it('should handle font_hover enabled after font_theme change', () => {
            component.font_theme = 'Light';
            component.font_hover = true;
            component.ngOnInit();

            expect(component.algoIconHandler).toBeDefined();
            expect(component.algoIconHandler?.activeWeight).toBe('Light');
        });
    });
});
