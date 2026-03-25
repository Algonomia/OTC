import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableIconTextComponent } from './algo-table-icon-text.component';
import { TranslateModule } from '@ngx-translate/core';

describe('AlgoTableIconTextComponent', () => {
    let component: AlgoTableIconTextComponent;
    let fixture: ComponentFixture<AlgoTableIconTextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableIconTextComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableIconTextComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Conditional Rendering - Icon', () => {
        it('should render icon when icon is provided', () => {
            fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            expect(icon).toBeTruthy();
        });

        it('should not render icon when icon is not provided', () => {
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            expect(icon).toBeFalsy();
        });

        it('should not render icon when icon is empty string', () => {
            fixture.componentRef.setInput('icon', '');
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            expect(icon).toBeFalsy();
        });
    });

    describe('Conditional Rendering - Text', () => {
        it('should render text when text is provided', () => {
            fixture.componentRef.setInput('text', 'Test text');
            fixture.detectChanges();

            const span = fixture.nativeElement.querySelector('span');
            expect(span).toBeTruthy();
        });

        it('should not render text when text is not provided', () => {
            fixture.detectChanges();

            const span = fixture.nativeElement.querySelector('span');
            expect(span).toBeFalsy();
        });

        it('should not render text when text is empty string', () => {
            fixture.componentRef.setInput('text', '');
            fixture.detectChanges();

            const span = fixture.nativeElement.querySelector('span');
            expect(span).toBeFalsy();
        });
    });

    describe('Combined Rendering', () => {
        it('should render both icon and text when both are provided', () => {
            fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
            fixture.componentRef.setInput('text', 'Add Item');
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            const span = fixture.nativeElement.querySelector('span');

            expect(icon).toBeTruthy();
            expect(span).toBeTruthy();
        });

        it('should render only icon when text is not provided', () => {
            fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            const span = fixture.nativeElement.querySelector('span');

            expect(icon).toBeTruthy();
            expect(span).toBeFalsy();
        });

        it('should render only text when icon is not provided', () => {
            fixture.componentRef.setInput('text', 'Text only');
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            const span = fixture.nativeElement.querySelector('span');

            expect(icon).toBeFalsy();
            expect(span).toBeTruthy();
        });
    });
});
