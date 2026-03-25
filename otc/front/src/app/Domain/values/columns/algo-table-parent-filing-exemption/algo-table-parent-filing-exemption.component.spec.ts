import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoTableParentFilingExemptionComponent } from './algo-table-parent-filing-exemption.component';

describe('AlgoTableParentFilingExemptionComponent', () => {
  let component: AlgoTableParentFilingExemptionComponent;
  let fixture: ComponentFixture<AlgoTableParentFilingExemptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgoTableParentFilingExemptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlgoTableParentFilingExemptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
