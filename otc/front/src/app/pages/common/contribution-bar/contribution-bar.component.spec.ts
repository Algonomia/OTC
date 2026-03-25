import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributionBarComponent } from './contribution-bar.component';
import {TranslateModule} from '@ngx-translate/core';

describe('ContributionBarComponent', () => {
    let component: ContributionBarComponent;
    let fixture: ComponentFixture<ContributionBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ContributionBarComponent, TranslateModule.forRoot()]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ContributionBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
