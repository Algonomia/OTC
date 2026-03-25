import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StdActionMenuWithPopover } from './std-action-menu-with-popover';
import { EdgePopoverComponent } from '../../../plugs/edge-popover/edge-popover.component';
import { Component } from '@angular/core';

@Component({
    selector: 'app-edge-popover',
    standalone: true,
    template: '<ng-content></ng-content>'
})
class MockEdgePopoverComponent {}

describe('StdActionMenuWithPopover', () => {
    let component: StdActionMenuWithPopover<unknown[]>;
    let fixture: ComponentFixture<StdActionMenuWithPopover<unknown[]>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StdActionMenuWithPopover, MockEdgePopoverComponent]
        }).overrideComponent(StdActionMenuWithPopover, {
            remove: { imports: [EdgePopoverComponent] },
            add: { imports: [MockEdgePopoverComponent] }
        }).compileComponents();

        fixture = TestBed.createComponent(StdActionMenuWithPopover);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
