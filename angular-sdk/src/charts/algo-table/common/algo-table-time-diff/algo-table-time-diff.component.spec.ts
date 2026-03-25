import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoTableTimeDiffComponent } from './algo-table-time-diff.component';
import {TranslateModule} from '@ngx-translate/core';

describe('AlgoTableTimeDiffComponent', () => {
  let component: AlgoTableTimeDiffComponent;
  let fixture: ComponentFixture<AlgoTableTimeDiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgoTableTimeDiffComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlgoTableTimeDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
