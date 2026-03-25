import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BigButtonComponent } from './big-button.component';
import { TranslateModule } from '@ngx-translate/core';

describe('BigButtonComponent', () => {
    let component: BigButtonComponent;
    let fixture: ComponentFixture<BigButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BigButtonComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BigButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have default weight_font_theme of Normal', () => {
            expect(component.weight_font_theme).toBe('Normal');
        });
    });
});
