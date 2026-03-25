import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonSizeType } from '../button.component';
import { ButtonComponent } from '../button.component';

interface IconBehaviorOptions {
    trigger?: 'text' | 'icon';
    position?: 'right' | 'left';
    hasLeftIconInput?: boolean;
}

export interface SizeThemeConfig {
    size: ButtonSizeType;
    expectedHeight: number;
    expectedFontSize: number;
}

/**
 * Configuration for size theme tests
 */
export const SIZE_THEMES: SizeThemeConfig[] = [
    { size: 'Small', expectedHeight: 30, expectedFontSize: 0.812 },
    { size: 'Normal', expectedHeight: 32, expectedFontSize: 0.875 },
    { size: 'Regular', expectedHeight: 36, expectedFontSize: 1 },
    { size: 'Medium', expectedHeight: 38, expectedFontSize: 1.12 },
    { size: 'Large', expectedHeight: 50, expectedFontSize: 1.125 },
    { size: 'ExtraLarge', expectedHeight: 50, expectedFontSize: 1.25 }
];

/**
 * Helper to retrieve inner ButtonComponent instance
 */
export function getButtonInstance<T>(
    fixture: ComponentFixture<T>
): ButtonComponent {
    const debugEl = fixture.debugElement.query(By.directive(ButtonComponent));
    return debugEl.componentInstance;
}

/**
 * Helper to test that a wrapper passes the correct size_theme
 */
export function expectButtonSizeTheme<T>(
    getFixture: () => ComponentFixture<T>,
    expectedSize: ButtonSizeType
) {
    const expectedConfig = SIZE_THEMES.find(s => s.size === expectedSize)!;

    it(`should pass size_theme "${expectedSize}" to ButtonComponent`, () => {
        const fixture = getFixture();
        fixture.detectChanges();

        const button = getButtonInstance(fixture);
        expect(button.height).toBe(expectedConfig.expectedHeight);
        expect(button.font_size_rem).toBe(expectedConfig.expectedFontSize);
    });
}

/**
 * Helper to test disabled_btn mapping
 */
export function expectButtonDisabled<T>(
    getFixture: () => ComponentFixture<T>,
    disabledValue: boolean
) {
    it(`should pass disabled=${disabledValue} to ButtonComponent`, () => {
        const fixture = getFixture();
        fixture.componentRef.setInput('disabled_btn', disabledValue);
        fixture.detectChanges();

        const button = getButtonInstance(fixture);
        expect(button.disabled).toBe(disabledValue);
    });
}

/**
 * Helper générique pour tester la logique des icônes
 */
function expectIconBehaviorBase<T>(
    getFixture: () => ComponentFixture<T>,
    expectedIcon: string,
    options: IconBehaviorOptions,
    textConfig: {
        setTextPresent: (fixture: ComponentFixture<T>) => void;
        setTextAbsent: (fixture: ComponentFixture<T>) => void;
        needsTextForDefault: boolean;
    }
) {
    const { trigger = 'text', position = 'right', hasLeftIconInput = false } = options;
    const positionKey = position === 'right' ? 'rightIcon' : 'leftIcon';
    const oppositePositionKey = position === 'right' ? 'leftIcon' : 'rightIcon';

    describe('icon logic', () => {
        it(`should pass ${positionKey} by default`, () => {
            const fixture = getFixture();

            if (trigger === 'text' && textConfig.needsTextForDefault) {
                textConfig.setTextPresent(fixture);
            }

            fixture.detectChanges();

            const button = getButtonInstance(fixture);
            expect(button[positionKey]).toBe(expectedIcon);

            if (trigger === 'text') {
                expect(button.singleIcon).toBe('');
            }
        });

        if (trigger === 'text') {
            it('should pass singleIcon when no text', () => {
                const fixture = getFixture();
                textConfig.setTextAbsent(fixture);
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.singleIcon).toBe(expectedIcon);
                expect(button[positionKey]).toBe('');
            });
        }

        if (trigger === 'icon') {
            it('should not pass icons when icon=false', () => {
                const fixture = getFixture();
                fixture.componentRef.setInput('icon', false);
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.leftIcon).toBe('');
                expect(button.rightIcon).toBe('');
            });
        }

        if (hasLeftIconInput) {
            it(`should pass ${positionKey} when left_icon=false`, () => {
                const fixture = getFixture();

                if (trigger === 'text' && textConfig.needsTextForDefault) {
                    textConfig.setTextPresent(fixture);
                }

                fixture.componentRef.setInput('left_icon', false);
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button[positionKey]).toBe(expectedIcon);
                expect(button[oppositePositionKey]).toBe('');
            });

            it(`should pass ${oppositePositionKey} when left_icon=true`, () => {
                const fixture = getFixture();

                if (trigger === 'text' && textConfig.needsTextForDefault) {
                    textConfig.setTextPresent(fixture);
                }

                fixture.componentRef.setInput('left_icon', true);
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button[oppositePositionKey]).toBe(expectedIcon);
                expect(button[positionKey]).toBe('');
            });
        }
    });
}

/**
 * Helper: teste icon position with text: string
 */
export function expectIconBehaviorWithStringText<T>(
    getFixture: () => ComponentFixture<T>,
    expectedIcon: string,
    options: IconBehaviorOptions = {}
) {
    expectIconBehaviorBase(getFixture, expectedIcon, options, {
        setTextPresent: (fixture) => fixture.componentRef.setInput('text', 'Test'),
        setTextAbsent: (fixture) => fixture.componentRef.setInput('text', ''),
        needsTextForDefault: true
    });
}

/**
 * Helper: teste icon position with text: boolean
 */
export function expectIconBehaviorWithBooleanText<T>(
    getFixture: () => ComponentFixture<T>,
    expectedIcon: string,
    options: IconBehaviorOptions = {}
) {
    expectIconBehaviorBase(getFixture, expectedIcon, options, {
        setTextPresent: (fixture) => fixture.componentRef.setInput('text', true),
        setTextAbsent: (fixture) => fixture.componentRef.setInput('text', false),
        needsTextForDefault: false
    });
}
