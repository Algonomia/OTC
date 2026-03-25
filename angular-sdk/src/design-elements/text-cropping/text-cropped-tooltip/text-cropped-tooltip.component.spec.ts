import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextCroppedTooltipComponent } from './text-cropped-tooltip.component';

describe('TextCroppedTooltipComponent', () => {
    let component: TextCroppedTooltipComponent;
    let fixture: ComponentFixture<TextCroppedTooltipComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TextCroppedTooltipComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TextCroppedTooltipComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
