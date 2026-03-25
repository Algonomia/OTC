import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Color_theme, Border_theme, LabelComponent } from '../label.component';
import { IconWeight } from '../../algo-icon/weight-handler';

/**
 * Configuration for default label properties tests
 */
export interface LabelDefaultConfig {
    color_theme: Color_theme;
    height: number;
    border_theme: Border_theme;
    weight: IconWeight;
    radius?: string;
    icon?: string;
    text?: string | boolean;
    counter?: number;
    [key: string]: any;
}

/**
 * Helper to test default configuration of label wrapper components
 */
export function labelTestDefaultConfig<T>(
    getFixture: () => ComponentFixture<T>,
    expectedConfig: LabelDefaultConfig
) {
    describe('Default Configuration', () => {
        it('should have correct default configuration', () => {
            const fixture = getFixture();
            const component = fixture.componentInstance as any;

            Object.entries(expectedConfig).forEach(([key, value]) => {
                expect(component[key]).toBe(value);
            });
        });
    });
}

/**
 * Helper to test that properties are correctly passed to LabelComponent
 */
export function labelTestPassPropertiesToLabel<T>(
    getFixture: () => ComponentFixture<T>,
    expectedProps: Partial<Record<keyof LabelComponent, any>>
) {
    describe('Properties Passed to LabelComponent', () => {
        let labelElement: DebugElement;

        beforeEach(() => {
            const fixture = getFixture();
            fixture.detectChanges();
            labelElement = fixture.debugElement.query(By.directive(LabelComponent));
        });

        it('should pass correct properties to LabelComponent', () => {
            const labelComponent = labelElement.componentInstance;

            Object.entries(expectedProps).forEach(([key, value]) => {
                expect(labelComponent[key]).toBe(value);
            });
        });
    });
}

/**
 * Helper to test counter input and rendering
 */
export function labelTestCounterInput<T>(
    getFixture: () => ComponentFixture<T>
) {
    describe('counter input', () => {
        it('should accept counter input via setInput', () => {
            const fixture = getFixture();
            fixture.componentRef.setInput('counter', 5);
            fixture.detectChanges();
            expect((fixture.componentInstance as any).counter).toBe(5);
        });

        it('should render counter value', () => {
            const fixture = getFixture();
            fixture.componentRef.setInput('counter', 12);
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toContain('12');
        });

        it('should update counter when input changes', () => {
            const fixture = getFixture();
            fixture.componentRef.setInput('counter', 3);
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toContain('3');

            fixture.componentRef.setInput('counter', 9);
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toContain('9');
        });
    });
}

/**
 * Helper to test text input
 */
export function labelTestTextInput<T>(
    getFixture: () => ComponentFixture<T>
) {
    describe('text input', () => {
        it('should accept custom text input', () => {
            const fixture = getFixture();
            const component = fixture.componentInstance as any;
            component.text = 'Custom Text';
            expect(component.text).toBe('Custom Text');
        });

        it('should accept text input via setInput', () => {
            const fixture = getFixture();
            fixture.componentRef.setInput('text', 'Test Text');
            fixture.detectChanges();
            expect((fixture.componentInstance as any).text).toBe('Test Text');
        });
    });
}

/**
 * Helper to test icon input
 */
export function labelTestIconInput<T>(
    getFixture: () => ComponentFixture<T>,
    iconSelector: string = '.left-icon-light'
) {
    describe('icon input', () => {
        it('should accept custom icon input', () => {
            const fixture = getFixture();
            const component = fixture.componentInstance as any;
            component.icon = 'Action/Navigation/Check';
            expect(component.icon).toBe('Action/Navigation/Check');
        });

        it('should render icon when icon input is provided', () => {
            const fixture = getFixture();
            fixture.componentRef.setInput('icon', 'Action/Navigation/Check');
            fixture.componentRef.setInput('text', 'Info');
            fixture.detectChanges();

            const iconElement = fixture.nativeElement.querySelector(iconSelector);
            expect(iconElement).toBeTruthy();
        });
    });
}

/**
 * Helper to test radius input
 */
export function labelTestRadiusInput<T>(
    getFixture: () => ComponentFixture<T>
) {
    describe('radius input', () => {
        it('should accept custom radius input via setInput', () => {
            const fixture = getFixture();
            fixture.componentRef.setInput('radius', '10px');
            fixture.detectChanges();

            const labelElement = fixture.debugElement.query(By.directive(LabelComponent));
            const labelComponent = labelElement.componentInstance;

            expect(labelComponent.radius).toBe('10px');
        });

        it('should pass radius to LabelComponent', () => {
            const fixture = getFixture();
            fixture.componentRef.setInput('radius', '5px');
            fixture.detectChanges();

            const labelElement = fixture.debugElement.query(By.directive(LabelComponent));
            const labelComponent = labelElement.componentInstance;

            expect(labelComponent.radius).toBe('5px');
        });
    });
}

/**
 * Helper to test color theme based on type (for status labels)
 */
export interface TypeColorMapping {
    type: string;
    expectedColorTheme: Color_theme;
}

export function labelTestTypeColorMapping<T>(
    createNewFixture: () => ComponentFixture<T>,
    mappings: TypeColorMapping[]
) {
    describe('Type to Color Theme Mapping', () => {
        mappings.forEach(mapping => {
            it(`should use ${mapping.expectedColorTheme} color when type is ${mapping.type}`, () => {
                const fixture = createNewFixture();
                fixture.componentRef.setInput('type', mapping.type);
                fixture.detectChanges();

                const labelElement = fixture.debugElement.query(By.directive(LabelComponent));
                const labelComponent = labelElement.componentInstance;

                expect(labelComponent.color_theme).toBe(mapping.expectedColorTheme);
            });
        });
    });
}

/**
 * Helper to get label element
 */
export function getLabelElement<T>(fixture: ComponentFixture<T>): DebugElement {
    return fixture.debugElement.query(By.directive(LabelComponent));
}

/**
 * Helper to test that all expected inputs are defined
 */
export function labelTestInputsExist<T>(
    getFixture: () => ComponentFixture<T>,
    expectedInputs: string[]
) {
    describe('Component Inputs', () => {
        expectedInputs.forEach(inputName => {
            it(`should have ${inputName} input`, () => {
                const fixture = getFixture();
                const component = fixture.componentInstance as any;
                expect(component[inputName]).toBeDefined();
            });
        });
    });
}
