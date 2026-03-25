import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldComplexValueComponent } from './field-complex-value.component';

describe('FieldComplexValueComponent', () => {
  let component: FieldComplexValueComponent;
  let fixture: ComponentFixture<FieldComplexValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldComplexValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldComplexValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
