import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoTableTruncatedTextComponent } from './algo-table-truncated-text.component';

describe('AlgoTableTruncatedTextComponent', () => {
  let component: AlgoTableTruncatedTextComponent;
  let fixture: ComponentFixture<AlgoTableTruncatedTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgoTableTruncatedTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlgoTableTruncatedTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
