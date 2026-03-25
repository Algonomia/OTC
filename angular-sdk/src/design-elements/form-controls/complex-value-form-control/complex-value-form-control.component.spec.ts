import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexValueFormControlComponent } from './complex-value-form-control.component';

describe('ComplexValueFormControlComponent', () => {
  let component: ComplexValueFormControlComponent;
  let fixture: ComponentFixture<ComplexValueFormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplexValueFormControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplexValueFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
