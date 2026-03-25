import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoIconComponent } from './algo-icon.component';
import { IconWeight } from '../weight-handler';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('AlgoIconComponent', () => {
    let component: AlgoIconComponent;
    let fixture: ComponentFixture<AlgoIconComponent>;
    let svgElement: SVGElement;
    let useElement: SVGUseElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoIconComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoIconComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('name', 'Action/Navigation/Close');
        fixture.detectChanges();
        svgElement = fixture.nativeElement.querySelector('svg');
        useElement = fixture.nativeElement.querySelector('use');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default values', () => {
        it('should have empty label by default', () => {
            expect(component.label()).toBe('');
        });

        it('should have Normal weight by default', () => {
            expect(component.weight()).toBe('Normal');
        });

        it('should have empty name by default', () => {
            const newFixture = TestBed.createComponent(AlgoIconComponent);
            const newComponent = newFixture.componentInstance;

            expect(newComponent.name()).toBe('');
        });
    });

    describe('Icon name', () => {
        it('should render correct xlink:href with name', () => {
            fixture.componentRef.setInput('name', 'Action/Navigation/Search');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toContain('Action/Navigation/Search');
        });

        it('should update xlink:href when name changes', () => {
            fixture.componentRef.setInput('name', 'Action/Toggle/CheckboxSelect');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toContain('Action/Toggle/CheckboxSelect');
        });
    });

    describe('Icon weight', () => {
        const weights: IconWeight[] = ['Light', 'Normal', 'Regular', 'Medium'];

        weights.forEach(weight => {
            it(`should render correct xlink:href with ${weight} weight`, () => {
                fixture.componentRef.setInput('weight', weight);
                fixture.componentRef.setInput('name', 'Action/Navigation/Close');
                fixture.detectChanges();

                const useElement = fixture.nativeElement.querySelector('use');
                const href = useElement.getAttribute('xlink:href');

                expect(href).toBe(`assets/sprite.svg#${weight}:Action/Navigation/Close`);
            });
        });

        it('should update xlink:href when weight changes', () => {
            fixture.componentRef.setInput('name', 'Action/Navigation/Close');
            fixture.componentRef.setInput('weight', 'Light');
            fixture.detectChanges();

            let useElement = fixture.nativeElement.querySelector('use');
            let href = useElement.getAttribute('xlink:href');
            expect(href).toBe('assets/sprite.svg#Light:Action/Navigation/Close');

            fixture.componentRef.setInput('weight', 'Bold');
            fixture.detectChanges();

            useElement = fixture.nativeElement.querySelector('use');
            href = useElement.getAttribute('xlink:href');
            expect(href).toBe('assets/sprite.svg#Bold:Action/Navigation/Close');
        });
    });

    describe('xlink:href format', () => {
        it('should have correct sprite.svg path format', () => {
            fixture.componentRef.setInput('name', 'Action/Navigation/Close');
            fixture.componentRef.setInput('weight', 'Normal');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toMatch(/^assets\/sprite\.svg#/);
        });

        it('should format href as "assets/sprite.svg#weight:name"', () => {
            fixture.componentRef.setInput('name', 'Action/Navigation/Menu');
            fixture.componentRef.setInput('weight', 'Medium');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toBe('assets/sprite.svg#Medium:Action/Navigation/Menu');
        });

        it('should include colon separator between weight and name', () => {
            fixture.componentRef.setInput('name', 'Action/Navigation/Close');
            fixture.componentRef.setInput('weight', 'Regular');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toContain(':');
            expect(href.split(':').length).toBe(2);
        });
    });

    describe('Aria label', () => {
        it('should have empty aria-label by default', () => {
            expect(svgElement.getAttribute('aria-label')).toBe('');
        });

        it('should set aria-label when label is provided', () => {
            fixture.componentRef.setInput('label', 'Close button');
            fixture.detectChanges();

            const svg = fixture.nativeElement.querySelector('svg');
            expect(svg.getAttribute('aria-label')).toBe('Close button');
        });

        it('should update aria-label when label changes', () => {
            fixture.componentRef.setInput('label', 'Initial label');
            fixture.detectChanges();

            let svg = fixture.nativeElement.querySelector('svg');
            expect(svg.getAttribute('aria-label')).toBe('Initial label');

            fixture.componentRef.setInput('label', 'Updated label');
            fixture.detectChanges();

            svg = fixture.nativeElement.querySelector('svg');
            expect(svg.getAttribute('aria-label')).toBe('Updated label');
        });

        it('should handle empty string label', () => {
            fixture.componentRef.setInput('label', '');
            fixture.detectChanges();

            const svg = fixture.nativeElement.querySelector('svg');
            expect(svg.getAttribute('aria-label')).toBe('');
        });
    });

    describe('Input combinations', () => {
        it('should handle all inputs together', () => {
            fixture.componentRef.setInput('name', 'Action/Navigation/ValidCircled');
            fixture.componentRef.setInput('weight', 'Bold');
            fixture.componentRef.setInput('label', 'Validation icon');
            fixture.detectChanges();

            const svg = fixture.nativeElement.querySelector('svg');
            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(svg.getAttribute('aria-label')).toBe('Validation icon');
            expect(href).toBe('assets/sprite.svg#Bold:Action/Navigation/ValidCircled');
        });

        it('should work with minimal configuration (only name)', () => {
            fixture.componentRef.setInput('name', 'SimpleIcon');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toBe('assets/sprite.svg#Normal:SimpleIcon');
        });

        it('should handle multiple weight changes with same name', () => {
            fixture.componentRef.setInput('name', 'FixedIcon');

            const testWeights: IconWeight[] = ['Light', 'Normal', 'Medium'];

            testWeights.forEach(weight => {
                fixture.componentRef.setInput('weight', weight);
                fixture.detectChanges();

                const useElement = fixture.nativeElement.querySelector('use');
                const href = useElement.getAttribute('xlink:href');

                expect(href).toBe(`assets/sprite.svg#${weight}:FixedIcon`);
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle icon name with numbers', () => {
            fixture.componentRef.setInput('name', 'Icon123');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toContain('Icon123');
        });

        it('should handle label with special characters', () => {
            fixture.componentRef.setInput('label', 'Icon with "quotes" & special <chars>');
            fixture.detectChanges();

            const svg = fixture.nativeElement.querySelector('svg');
            expect(svg.getAttribute('aria-label')).toBe('Icon with "quotes" & special <chars>');
        });

        it('should handle empty name (although not recommended)', () => {
            fixture.componentRef.setInput('name', '');
            fixture.detectChanges();

            const useElement = fixture.nativeElement.querySelector('use');
            const href = useElement.getAttribute('xlink:href');

            expect(href).toBe('assets/sprite.svg#Normal:');
        });
    });

    describe('Accessibility', () => {
        it('should have proper accessibility attributes on svg', () => {
            const svg = fixture.nativeElement.querySelector('svg');

            expect(svg.getAttribute('role')).toBe('img');
            expect(svg.hasAttribute('aria-label')).toBe(true);
        });

        it('should be properly labeled for screen readers when label is provided', () => {
            fixture.componentRef.setInput('label', 'Search icon');
            fixture.componentRef.setInput('name', 'Action/Navigation/Search');
            fixture.detectChanges();

            const svg = fixture.nativeElement.querySelector('svg');

            expect(svg.getAttribute('role')).toBe('img');
            expect(svg.getAttribute('aria-label')).toBe('Search icon');
        });
    });

    describe('Component isolation', () => {
        it('should not affect other component instances', () => {
            const fixture2 = TestBed.createComponent(AlgoIconComponent);
            const component2 = fixture2.componentInstance;

            fixture.componentRef.setInput('name', 'Action/Navigation/ValidCircled');
            fixture.componentRef.setInput('weight', 'Light');

            fixture2.componentRef.setInput('name', 'Action/Navigation/Search');
            fixture2.componentRef.setInput('weight', 'Bold');

            fixture.detectChanges();
            fixture2.detectChanges();

            const use1 = fixture.nativeElement.querySelector('use');
            const use2 = fixture2.nativeElement.querySelector('use');

            expect(use1.getAttribute('xlink:href')).toBe('assets/sprite.svg#Light:Action/Navigation/ValidCircled');
            expect(use2.getAttribute('xlink:href')).toBe('assets/sprite.svg#Bold:Action/Navigation/Search');

            fixture2.destroy();
        });
    });
});
