import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionItemComponent } from './accordion-item.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    template: `
        <ng-template #itemTemplate>
            <span class="projected-content">Projected content</span>
        </ng-template>
    `
})
class TestHostComponent {
    @ViewChild('itemTemplate', { static: true })
    itemTemplate!: TemplateRef<unknown>;
}

describe('AccordionItemComponent', () => {
    let fixture: ComponentFixture<AccordionItemComponent>;
    let component: AccordionItemComponent;
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AccordionItemComponent, TestHostComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        hostFixture = TestBed.createComponent(TestHostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();

        fixture = TestBed.createComponent(AccordionItemComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('lineTitle', 'test.title');
        fixture.componentRef.setInput('itemTpl', hostComponent.itemTemplate);

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('Input: lineTitle', () => {
        it('should display the line title and render dots when defined', () => {
            const title = fixture.nativeElement.querySelector('.card-section');
            expect(title.textContent).toContain('test.title');

            const dots = fixture.nativeElement.querySelector('.dots');
            expect(dots).toBeTruthy();
        });

        it('should not render dots when lineTitle is empty', () => {
            fixture.componentRef.setInput('lineTitle', '');
            fixture.detectChanges();

            const dots = fixture.nativeElement.querySelector('.dots');
            expect(dots).toBeNull();
        });
    });

    describe('Input: itemTpl', () => {
        it('should render projected template content', () => {
            const projected = fixture.nativeElement.querySelector('.projected-content');

            expect(projected).toBeTruthy();
            expect(projected.textContent).toContain('Projected content');
        });
    });
});
