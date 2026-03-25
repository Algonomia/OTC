import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BarComponent } from './bar.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import {ScreenSize, WidthHeightListenerService} from '../../global-services/width-height-listener.service';

@Component({
    template: `
        <app-bar
            [contentTpl]="contentTemplate"
            [rounded]="rounded"
            [highlighted]="highlighted"
            [title]="title"
            [icon]="icon"
        ></app-bar>

        <ng-template #contentTemplate>
            <div class="test-content">Test Content</div>
        </ng-template>
    `,
    standalone: true,
    imports: [BarComponent]
})
class TestHostComponent {
    @ViewChild(BarComponent) barComponent!: BarComponent;
    @ViewChild('contentTemplate') contentTemplate!: TemplateRef<any>;

    rounded = false;
    highlighted = false;
    title = '';
    icon = '';
}

describe('BarComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: BarComponent;
    let screenSubject: Subject<ScreenSize>;

    beforeEach(async () => {
        screenSubject = new Subject<ScreenSize>();
        spyOnProperty(WidthHeightListenerService, 'windowScreenListener', 'get').and.returnValue(screenSubject.asObservable());

        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.barComponent;
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have default rounded of false', () => {
            expect(component.rounded).toBe(false);
        });

        it('should have default highlighted of false', () => {
            expect(component.highlighted).toBe(false);
        });

        it('should have default title of empty string', () => {
            expect(component.title).toBe('');
        });

        it('should have default icon of empty string', () => {
            expect(component.icon).toBe('');
        });
    });

    describe('Conditional CSS Classes', () => {
        it('should apply highlighted class when highlighted is true', () => {
            host.highlighted = true;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.bar');
            expect(container.classList.contains('highlighted')).toBe(true);
        });

        it('should not apply highlighted class when highlighted is false', () => {
            host.highlighted = false;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.bar');
            expect(container.classList.contains('highlighted')).toBe(false);
        });

        it('should apply rounded class when rounded is true', () => {
            host.rounded = true;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.bar');
            expect(container.classList.contains('rounded')).toBe(true);
        });

        it('should not apply rounded class when rounded is false', () => {
            host.rounded = false;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.bar');
            expect(container.classList.contains('rounded')).toBe(false);
        });

        it('should apply both highlighted and rounded classes together', () => {
            host.highlighted = true;
            host.rounded = true;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.bar');
            expect(container.classList.contains('highlighted')).toBe(true);
            expect(container.classList.contains('rounded')).toBe(true);
        });
    });

    describe('Conditional Rendering - Icon', () => {
        it('should render icon when icon is provided', () => {
            host.icon = 'Action/Navigation/Add';
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            expect(icon).toBeTruthy();
        });

        it('should not render icon when icon is empty', () => {
            host.icon = '';
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            expect(icon).toBeFalsy();
        });
    });

    describe('Conditional Rendering - Title', () => {
        it('should render title when title is provided', () => {
            host.title = 'My Title';
            fixture.detectChanges();

            const titleText = fixture.nativeElement.querySelector('.text-title');
            expect(titleText).toBeTruthy();
        });

        it('should not render title when title is empty', () => {
            host.title = '';
            fixture.detectChanges();

            const titleText = fixture.nativeElement.querySelector('.text-title');
            expect(titleText).toBeFalsy();
        });
    });

    describe('Template Projection', () => {
        it('should render content template when provided', () => {
            const content = fixture.nativeElement.querySelector('.test-content');
            expect(content).toBeTruthy();
        });

        it('should not render content when contentTpl is not provided', () => {
            @Component({
                template: `<app-bar [title]="'Test'"></app-bar>`,
                standalone: true,
                imports: [BarComponent]
            })
            class NoContentHostComponent {}

            const noContentFixture = TestBed.createComponent(NoContentHostComponent);
            noContentFixture.detectChanges();

            const content = noContentFixture.nativeElement.querySelector('.test-content');
            expect(content).toBeFalsy();

            noContentFixture.destroy();
        });
    });
});
