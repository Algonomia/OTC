import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { EdgePopoverComponent } from './edge-popover.component';
import { PopoverModule, Popover } from 'primeng/popover';
import { Subject } from 'rxjs';

@Component({
    standalone: true,
    imports: [EdgePopoverComponent],
    template: `
        <ng-template #triggerTpl>Trigger</ng-template>
        <ng-template #contentTpl>Content</ng-template>
        <app-edge-popover [triggerIsOpenTpl]="triggerTpl"
                          [contentTpl]="contentTpl"
                          [styleClass]="styleClass"
                          (openClose)="onOpenClose($event)">
        </app-edge-popover>
    `
})
class TestHostComponent {
    @ViewChild(EdgePopoverComponent) popoverComponent!: EdgePopoverComponent;
    styleClass = 'my-class';
    onOpenClose = jasmine.createSpy('onOpenClose');
}

describe('EdgePopoverComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: EdgePopoverComponent;
    let mockPopover: Partial<Popover>;

    beforeEach(async () => {
        EdgePopoverComponent.notifyOpened$ = new Subject<EdgePopoverComponent>();

        await TestBed.configureTestingModule({
            imports: [EdgePopoverComponent, PopoverModule, TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.popoverComponent;

        mockPopover = {
            toggle: jasmine.createSpy('toggle'),
            hide: jasmine.createSpy('hide'),
            align: jasmine.createSpy('align')
        };
        component.popover = mockPopover as Popover;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept triggerIsOpenTpl input', () => {
            expect(component.triggerIsOpenTpl).toBeDefined();
        });

        it('should accept contentTpl input', () => {
            expect(component.contentTpl).toBeDefined();
        });

        it('should accept styleClass input', () => {
            expect(component.styleClass).toBe('my-class');
        });

        it('should have default styleClass as empty string', () => {
            const newFixture = TestBed.createComponent(EdgePopoverComponent);
            newFixture.detectChanges();
            expect(newFixture.componentInstance.styleClass).toBe('');
        });
    });

    describe('Template Rendering', () => {
        it('should render the trigger template', () => {
            const triggerEl = fixture.nativeElement.querySelector('div');
            expect(triggerEl.textContent).toContain('Trigger');
        });

        it('should render the popover element', () => {
            const popoverEl = fixture.nativeElement.querySelector('p-popover');
            expect(popoverEl).toBeTruthy();
        });
    });

    describe('toggle', () => {
        it('should call popover.toggle with the event', () => {
            const event = new MouseEvent('click');
            spyOn(event, 'stopPropagation');
            component.toggle(event);

            expect(mockPopover.toggle).toHaveBeenCalledWith(event);
        });

        it('should stop event propagation', () => {
            const event = new MouseEvent('click');
            spyOn(event, 'stopPropagation');
            component.toggle(event);

            expect(event.stopPropagation).toHaveBeenCalled();
        });

        it('should call markForCheck', () => {
            const cdSpy = spyOn(component['_cd'], 'markForCheck');
            const event = new MouseEvent('click');
            component.toggle(event);

            expect(cdSpy).toHaveBeenCalled();
        });
    });

    describe('onShow', () => {
        it('should emit openClose with true', () => {
            const spy = spyOn(component.openClose, 'next');
            component.onShow();

            expect(spy).toHaveBeenCalledWith(true);
        });

        it('should notify other popovers via static Subject', () => {
            const notifySpy = spyOn(EdgePopoverComponent.notifyOpened$, 'next');
            component.onShow();

            expect(notifySpy).toHaveBeenCalledWith(component);
        });

        it('should call popover.align after timeout', fakeAsync(() => {
            component.onShow();
            tick(0);

            expect(mockPopover.align).toHaveBeenCalled();
        }));
    });

    it('should emit openClose with false', () => {
        const spy = spyOn(component.openClose, 'next');
        component.onHide();

        expect(spy).toHaveBeenCalledWith(false);
    });
});
