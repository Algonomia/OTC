import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { CreateComplexValueTypeComponent } from './create-complex-value-type.component';
import { TranslateModule } from '@ngx-translate/core';
import { EValueType, TComplexValue } from '@algonomia/ts-shared';
import { EdgePopoverComponent } from '../../../../../../plugs/edge-popover/edge-popover.component';
import { StdMenuComponent } from '../../../../../menus/std-menu/std-menu.component';

@Component({
    selector: 'app-edge-popover',
    standalone: true,
    template: '<ng-content></ng-content>'
})
class MockEdgePopoverComponent {}

describe('CreateComplexValueTypeComponent', () => {
    let component: CreateComplexValueTypeComponent;
    let fixture: ComponentFixture<CreateComplexValueTypeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateComplexValueTypeComponent, TranslateModule.forRoot(), MockEdgePopoverComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(StdMenuComponent, {
            remove: { imports: [EdgePopoverComponent] },
            add: { imports: [MockEdgePopoverComponent] }
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateComplexValueTypeComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getNewComplexValue method', () => {
        it('should copy primitive complex value', () => {
            const primitiveValue: Partial<TComplexValue> = {
                type: EValueType.Constant
            };

            const result = component.getNewComplexValue(primitiveValue);

            expect(result).toEqual(primitiveValue);
            expect(result).not.toBe(primitiveValue);
        });

        it('should initialize args as empty array when type is operation', () => {
            const primitiveValue: Partial<TComplexValue> = {
                type: EValueType.Operation
            };

            const result = component.getNewComplexValue(primitiveValue);

            expect('args' in result).toBe(true);
            expect((result as { args?: TComplexValue[] }).args).toEqual([]);
        });

        it('should not add args when type is not operation', () => {
            const primitiveValue: Partial<TComplexValue> = {
                type: EValueType.Constant
            };

            const result = component.getNewComplexValue(primitiveValue);

            expect((result as { args?: TComplexValue[] }).args).toBeUndefined();
        });

        it('should preserve other properties when copying', () => {
            const primitiveValue: Partial<TComplexValue> = {
                type: EValueType.Tag
            };

            const result = component.getNewComplexValue(primitiveValue);

            expect(result.type).toBe(EValueType.Tag);
        });
    });
});
