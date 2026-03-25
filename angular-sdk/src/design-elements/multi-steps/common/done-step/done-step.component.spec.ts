import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DoneStepComponent } from './done-step.component';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import {NgClass} from '@angular/common';

@Component({
    selector: 'app-algo-icon',
    standalone: true,
    template: `<span class="icon-{{name}}"></span>`
})
class MockAlgoIconComponent {
    @Input() name!: string;
}

describe('DoneStepComponent', () => {
    let component: DoneStepComponent;
    let fixture: ComponentFixture<DoneStepComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                DoneStepComponent,
                MockAlgoIconComponent,
                TranslateModule.forRoot()
            ]
        }).overrideComponent(DoneStepComponent, {
            set: {
                imports: [
                    NgClass,
                    MockAlgoIconComponent,
                    TranslateModule
                ]
            }
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DoneStepComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit close event after 4 seconds', fakeAsync(() => {
        let closeEmitted = false;
        component.close.subscribe(() => {
            closeEmitted = true;
        });

        component.ngOnInit();

        expect(closeEmitted).toBe(false);
        tick(4000);
        expect(closeEmitted).toBe(true);
    }));

    it('should display messages when provided', () => {
        component.messages = ['Message 1', 'Message 2', 'Message 3'];
        fixture.detectChanges();

        const textElements = fixture.nativeElement.querySelectorAll('.text');
        expect(textElements.length).toBe(3);
        expect(textElements[0].textContent.trim()).toBe('Message 1');
        expect(textElements[1].textContent.trim()).toBe('Message 2');
        expect(textElements[2].textContent.trim()).toBe('Message 3');
    });

    it('should not display text container when messages is empty', () => {
        component.messages = [];
        fixture.detectChanges();

        const textContainer = fixture.nativeElement.querySelector('.text-container');
        expect(textContainer).toBeFalsy();
    });

    it('should not display text container when messages is undefined', () => {
        fixture.detectChanges();

        const textContainer = fixture.nativeElement.querySelector('.text-container');
        expect(textContainer).toBeFalsy();
    });

    it('should display single message', () => {
        component.messages = ['Single Message'];
        fixture.detectChanges();

        const textElements = fixture.nativeElement.querySelectorAll('.text');
        expect(textElements.length).toBe(1);
        expect(textElements[0].textContent.trim()).toBe('Single Message');
    });

    it('should add pad-top-1 class to all messages except the first', () => {
        component.messages = ['First', 'Second', 'Third'];
        fixture.detectChanges();

        const textElements = fixture.nativeElement.querySelectorAll('.text');
        expect(textElements[0].classList.contains('pad-top-1')).toBe(false);
        expect(textElements[1].classList.contains('pad-top-1')).toBe(true);
        expect(textElements[2].classList.contains('pad-top-1')).toBe(true);
    });

    it('should display heart container', () => {
        component.messages = ['Test'];
        fixture.detectChanges();

        const heartContainer = fixture.nativeElement.querySelector('.heart-container');
        expect(heartContainer).toBeTruthy();
    });

    it('should display rings container', () => {
        component.messages = ['Test'];
        fixture.detectChanges();

        const rings = fixture.nativeElement.querySelector('.rings');
        expect(rings).toBeTruthy();
    });

    it('should display 4 rings', () => {
        component.messages = ['Test'];
        fixture.detectChanges();

        const ringElements = fixture.nativeElement.querySelectorAll('.ring');
        expect(ringElements.length).toBe(4);
    });

    it('should display like icon', () => {
        component.messages = ['Test'];
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.directive(MockAlgoIconComponent));
        expect(icon).toBeTruthy();
        expect(icon.componentInstance.name).toBe('People/Community/LikeEmpty');
    });

    it('should have correct container classes', () => {
        component.messages = ['Test'];
        fixture.detectChanges();

        const container = fixture.nativeElement.querySelector('.flex.flex-column.pad-1.gap-1');
        expect(container).toBeTruthy();
    });

    it('should emit close event only once', fakeAsync(() => {
        let emitCount = 0;
        component.close.subscribe(() => {
            emitCount++;
        });

        component.ngOnInit();
        tick(4000);

        expect(emitCount).toBe(1);
    }));

    it('should handle multiple messages correctly', () => {
        const manyMessages = Array.from({ length: 10 }, (_, i) => `Message ${i + 1}`);
        component.messages = manyMessages;
        fixture.detectChanges();

        const textElements = fixture.nativeElement.querySelectorAll('.text');
        expect(textElements.length).toBe(10);

        // Vérifier que le premier n'a pas pad-top-1
        expect(textElements[0].classList.contains('pad-top-1')).toBe(false);

        // Vérifier que tous les autres ont pad-top-1
        for (let i = 1; i < textElements.length; i++) {
            expect(textElements[i].classList.contains('pad-top-1')).toBe(true);
        }
    });

    it('should translate messages', () => {
        component.messages = ['Test.Message'];
        fixture.detectChanges();

        const textElement = fixture.nativeElement.querySelector('.text');
        expect(textElement.textContent.trim()).toBe('Test.Message');
    });

    it('should display heart container even without messages', () => {
        component.messages = [];
        fixture.detectChanges();

        const heartContainer = fixture.nativeElement.querySelector('.heart-container');
        expect(heartContainer).toBeTruthy();
    });

    it('should have icon with correct class', () => {
        component.messages = ['Test'];
        fixture.detectChanges();

        const iconElement = fixture.nativeElement.querySelector('.icon');
        expect(iconElement).toBeTruthy();
    });

    it('should emit close after timeout even without messages', fakeAsync(() => {
        let closeEmitted = false;
        component.close.subscribe(() => {
            closeEmitted = true;
        });

        component.messages = [];
        fixture.detectChanges();
        component.ngOnInit();

        tick(4000);
        expect(closeEmitted).toBe(true);
    }));

    it('should track messages correctly in for loop', () => {
        component.messages = ['Msg1', 'Msg2', 'Msg1'];
        fixture.detectChanges();

        const textElements = fixture.nativeElement.querySelectorAll('.text');
        expect(textElements.length).toBe(3);
        expect(textElements[0].textContent.trim()).toBe('Msg1');
        expect(textElements[1].textContent.trim()).toBe('Msg2');
        expect(textElements[2].textContent.trim()).toBe('Msg1');
    });
});
