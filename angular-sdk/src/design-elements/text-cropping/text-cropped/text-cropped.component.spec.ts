import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextCroppedComponent } from './text-cropped.component';

describe('TextCroppedComponent', () => {
  let component: TextCroppedComponent;
  let fixture: ComponentFixture<TextCroppedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextCroppedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextCroppedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
