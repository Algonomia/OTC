import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelMenuSelectedComponent } from './label-menu-selected.component';
import {TranslateModule} from '@ngx-translate/core';

describe('LabelMenuSelectedComponent', () => {
    let component: LabelMenuSelectedComponent;
    let fixture: ComponentFixture<LabelMenuSelectedComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LabelMenuSelectedComponent, TranslateModule.forRoot()]
        });
        fixture = TestBed.createComponent(LabelMenuSelectedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
