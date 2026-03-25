import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EditModalComponent } from './edit-modal.component';
import { AuthLinkedinService } from '../../../global-services/auth.linkedin.service';
import { ModalService } from '../../../../global-services/modal.service';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { TUser } from '@otc/domain';
import { MetaFormGroup } from '../../../../custom-angular-forms/metaforms';

@Component({
    selector: 'app-button-main-action',
    standalone: true,
    template: `<button [disabled]="disabled_btn" [type]="type">{{text}}</button>`
})
class MockButtonMainActionComponent {
    @Input() text!: string;
    @Input() type: string = 'button';
    @Input() disabled_btn: boolean = false;
}

@Component({
    selector: 'app-meta-form-group',
    standalone: true,
    template: `<div class="meta-form-group"></div>`
})
class MockMetaFormGroupComponent {
    @Input() metaFormGroup!: MetaFormGroup;
}

class MockAuthLinkedinService {
    private _userInfo$ = new BehaviorSubject<TUser | undefined>(undefined);
    getUserInfo$ = this._userInfo$.asObservable();

    setUser(user: TUser | undefined) {
        this._userInfo$.next(user);
    }

    updateUserInfo(data: any) {}
}

class MockModalService {
    close() {}
}

describe('EditModalComponent', () => {
    let component: EditModalComponent;
    let fixture: ComponentFixture<EditModalComponent>;
    let authLinkedinService: MockAuthLinkedinService;
    let modalService: MockModalService;

    const mockUser: TUser = {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        picture: 'https://example.com/picture.jpg',
        email: 'john.doe@example.com',
        email_verified: true,
        country: 'France',
        language: 'fr',
        job: 'Developer',
        company: 'Tech Corp',
        phone: '0123456789',
        pro_email: 'john.doe@techcorp.com',
        cgu: true
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditModalComponent,
                MockButtonMainActionComponent,
                MockMetaFormGroupComponent,
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: AuthLinkedinService, useClass: MockAuthLinkedinService },
                { provide: ModalService, useClass: MockModalService }
            ]
        }).overrideComponent(EditModalComponent, {
            set: {
                imports: [
                    MockButtonMainActionComponent,
                    MockMetaFormGroupComponent,
                    TranslateModule
                ]
            }
        }).compileComponents();

        authLinkedinService = TestBed.inject(AuthLinkedinService) as any;
        modalService = TestBed.inject(ModalService) as any;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditModalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize userForm as undefined', () => {
        expect(component.userForm).toBeUndefined();
    });

    it('should create userForm when user data is available', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        tick();
        fixture.detectChanges();
        tick();

        expect(component.userForm).toBeDefined();

        const formValue = component.userForm?.value;
        expect(formValue?.job).toBeDefined();
        expect(formValue?.company).toBeDefined();
        expect(formValue?.pro_email).toBeDefined();
        expect(formValue?.phone).toBeDefined();
    }));

    it('should call createFromValidatorGroup with user data', fakeAsync(() => {
        const createSpy = spyOn(MetaFormGroup, 'createFromValidatorGroup').and.callThrough();

        authLinkedinService.setUser(mockUser);
        tick();
        fixture.detectChanges();
        tick();

        expect(component.userForm).toBeDefined();
        expect(createSpy).toHaveBeenCalled();

        const callArgs = createSpy.calls.mostRecent().args;
        const passedData = callArgs[1];

        expect(passedData?.['job']).toBe(mockUser.job);
        expect(passedData?.['company']).toBe(mockUser.company);
        expect(passedData?.['pro_email']).toBe(mockUser.pro_email);
        expect(passedData?.['phone']).toBe(mockUser.phone);
    }));

    it('should not display form when userForm is undefined', () => {
        fixture.detectChanges();

        const formGroup = fixture.debugElement.query(By.directive(MockMetaFormGroupComponent));
        expect(formGroup).toBeFalsy();
    });

    it('should display form when userForm is defined', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const formGroup = fixture.debugElement.query(By.directive(MockMetaFormGroupComponent));
        expect(formGroup).toBeTruthy();
    }));

    it('should display logo in header', () => {
        fixture.detectChanges();

        const logo = fixture.nativeElement.querySelector('.logo');
        expect(logo).toBeTruthy();
        expect(logo.src).toContain('assets/logo/Logo/Logo%20Medium.svg');
    });

    it('should display title in header', () => {
        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('.title');
        expect(title).toBeTruthy();
        expect(title.textContent.trim()).toBe('Profile');
    });

    it('should display submit button when form is available', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.directive(MockButtonMainActionComponent));
        expect(button).toBeTruthy();
        expect(button.componentInstance.text).toBe('OTCFront.CoreCommon.Confirm');
        expect(button.componentInstance.type).toBe('submit');
    }));

    it('should disable submit button when form is invalid', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();

        if (component.userForm) {
            spyOnProperty(component.userForm, 'invalid', 'get').and.returnValue(true);
        }
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.directive(MockButtonMainActionComponent));
        expect(button.componentInstance.disabled_btn).toBe(true);
    }));

    it('should enable submit button when form is valid', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();

        if (component.userForm) {
            spyOnProperty(component.userForm, 'invalid', 'get').and.returnValue(false);
        }
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.directive(MockButtonMainActionComponent));
        expect(button.componentInstance.disabled_btn).toBe(false);
    }));

    it('should call updateUserInfo and close modal on submit', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();

        spyOn(authLinkedinService, 'updateUserInfo');
        spyOn(modalService, 'close');

        component.onSubmit();

        expect(authLinkedinService.updateUserInfo).toHaveBeenCalled();
        expect(modalService.close).toHaveBeenCalled();
    }));

    it('should call onSubmit when submit button is clicked', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        spyOn(authLinkedinService, 'updateUserInfo');
        spyOn(modalService, 'close');

        const buttonComponent = fixture.nativeElement.querySelector('app-button-main-action');
        buttonComponent.click();
        fixture.detectChanges();

        expect(authLinkedinService.updateUserInfo).toHaveBeenCalled();
        expect(modalService.close).toHaveBeenCalled();
    }));

    it('should pass metaFormGroup to MetaFormGroupComponent', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const formGroupComponent = fixture.debugElement.query(By.directive(MockMetaFormGroupComponent));
        expect(formGroupComponent.componentInstance.metaFormGroup).toBe(component.userForm);
    }));

    it('should have correct layout structure', () => {
        fixture.detectChanges();

        const header = fixture.nativeElement.querySelector('.header');
        const container = fixture.nativeElement.querySelector('.container');

        expect(header).toBeTruthy();
        expect(container).toBeTruthy();
    });

    it('should have correct header classes', () => {
        fixture.detectChanges();

        const header = fixture.nativeElement.querySelector('.header');
        expect(header.classList.contains('std-aligned')).toBe(true);
        expect(header.classList.contains('pad-1')).toBe(true);
        expect(header.classList.contains('gap-1')).toBe(true);
    });

    it('should mark for check when user info is received', fakeAsync(() => {
        const changeDetectorRef = (component as any)._cd;
        spyOn(changeDetectorRef, 'markForCheck');

        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();

        expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
    }));

    it('should handle onSubmit with undefined userForm gracefully', () => {
        spyOn(authLinkedinService, 'updateUserInfo');
        spyOn(modalService, 'close');

        component.onSubmit();

        expect(authLinkedinService.updateUserInfo).toHaveBeenCalledWith({
            job: undefined,
            company: undefined,
            pro_email: undefined,
            phone: undefined
        });
        expect(modalService.close).toHaveBeenCalled();
    });

    it('should unsubscribe on component destroy', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();

        const initialForm = component.userForm;

        component.ngOnDestroy();

        authLinkedinService.setUser({
            ...mockUser,
            job: 'New Job'
        } as TUser);
        tick();

        expect(component.userForm).toBe(initialForm);
    }));

    it('should display footer with correct class', fakeAsync(() => {
        authLinkedinService.setUser(mockUser);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const footer = fixture.nativeElement.querySelector('.footer');
        expect(footer).toBeTruthy();
        expect(footer.classList.contains('pad-2')).toBe(true);
    }));
});
