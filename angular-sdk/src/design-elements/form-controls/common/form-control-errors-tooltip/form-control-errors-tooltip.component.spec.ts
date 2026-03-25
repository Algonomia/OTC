import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControlErrorsTooltipComponent } from './form-control-errors-tooltip.component';

describe('FormControlErrorsTooltipComponent', () => {
  let component: FormControlErrorsTooltipComponent;
  let fixture: ComponentFixture<FormControlErrorsTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlErrorsTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormControlErrorsTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
