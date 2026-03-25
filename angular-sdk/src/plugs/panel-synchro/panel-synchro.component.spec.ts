import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSynchroComponent } from './panel-synchro.component';

describe('PanelSynchroComponent', () => {
  let component: PanelSynchroComponent;
  let fixture: ComponentFixture<PanelSynchroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelSynchroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelSynchroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
