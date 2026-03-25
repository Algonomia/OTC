import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelUserComponent } from './label-user.component';
import { CommonModule } from '@angular/common';
import { CountryFlagComponent } from '../flags/country-flag/country-flag.component';
import {TUser, UserUtils} from '@otc/domain';

describe('LabelUserComponent', () => {
    let fixture: ComponentFixture<LabelUserComponent>;
    let component: LabelUserComponent;
    let mockUser: TUser;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LabelUserComponent,
                CommonModule,
                CountryFlagComponent
            ]
        });

        fixture = TestBed.createComponent(LabelUserComponent);
        component = fixture.componentInstance;
        mockUser = {
            id: '1',
            firstname: 'John',
            lastname: 'Doe',
            picture: 'https://example.com/picture.jpg',
            email: 'john.doe@example.com',
            email_verified: true,
            country: 'France',
            language: 'fr',
            job: 'dev',
            company: 'dev',
            phone: '00000000',
            pro_email: '',
            cgu: true
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default __name as empty string', () => {
        expect(component.__name).toBe('');
    });

    it('should update __name when user input is set', () => {
        component.user = mockUser;
        fixture.detectChanges();
        expect(component.__name).toBe(UserUtils.getUserFullName(mockUser));
    });
});
