import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCountryComponent } from './card-country.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CardCountryComponent', () => {
    let component: CardCountryComponent;
    let fixture: ComponentFixture<CardCountryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardCountryComponent, HttpClientTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(CardCountryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
