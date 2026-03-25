import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopCountriesComponent } from './top-countries.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('TopCountriesComponent', () => {
    let component: TopCountriesComponent;
    let fixture: ComponentFixture<TopCountriesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TopCountriesComponent, HttpClientTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(TopCountriesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
