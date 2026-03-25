import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceSourceComponent } from './choice-source.component';
import {TranslateModule} from '@ngx-translate/core';

describe('ChoiceSourceComponent', () => {
    let component: ChoiceSourceComponent;
    let fixture: ComponentFixture<ChoiceSourceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChoiceSourceComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ChoiceSourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
