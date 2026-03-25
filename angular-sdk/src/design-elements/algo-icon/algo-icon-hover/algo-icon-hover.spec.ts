import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoIconHover } from './algo-icon-hover';

describe('AlgoIconHover', () => {
  let component: AlgoIconHover;
  let fixture: ComponentFixture<AlgoIconHover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgoIconHover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlgoIconHover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
