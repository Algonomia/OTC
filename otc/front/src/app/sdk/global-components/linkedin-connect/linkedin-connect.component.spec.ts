import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkedinConnectComponent } from './linkedin-connect.component';
import { AuthLinkedinService } from '../../global-services/auth.linkedin.service';
import { ModalService } from '../../../global-services/modal.service';
import { Component, Input, TemplateRef, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import {TUser, UserUtils} from '@otc/domain';
import { LinkedinLoginModalComponent } from './linkedin-login-modal/linkedin-login-modal.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { IAction } from '../../../design-elements/menus/std-actions-menu/std-actions-menu.component';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-algo-icon',
    standalone: true,
    template: `<span class="icon-{{name}}"></span>`
})
class MockAlgoIconComponent {
    @Input() name!: string;
}

@Component({
    selector: 'app-std-action-menu-with-popover',
    standalone: true,
    imports: [
        NgTemplateOutlet
    ],
    template: `
        <ng-container *ngTemplateOutlet="triggerTpl"></ng-container>
    `
})
class MockStdActionMenuWithPopoverComponent {
    @Input() triggerTpl!: TemplateRef<unknown>;
    @Input() actions!: IAction<[]>[];
}

@Pipe({
    name: 'translate',
    standalone: true
})
class MockTranslatePipe implements PipeTransform {
    transform(value: string): string {
        return value;
    }
}

class MockAuthLinkedinService {
    private _userInfo$ = new BehaviorSubject<TUser | undefined>(undefined);
    getUserInfo$ = this._userInfo$.asObservable();

    setUser(user: TUser | undefined) {
        this._userInfo$.next(user);
    }

    disconnect() {
        this._userInfo$.next(undefined);
    }
}

class MockModalService {
    open = jasmine.createSpy('open').and.returnValue({ component: null, size: '', data: {} });
}

describe('LinkedinConnectComponent', () => {
    let component: LinkedinConnectComponent;
    let fixture: ComponentFixture<LinkedinConnectComponent>;
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
        job: 'dev',
        company: 'dev',
        phone: '00000000',
        pro_email: '',
        cgu: true
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LinkedinConnectComponent,
                MockAlgoIconComponent,
                MockStdActionMenuWithPopoverComponent,
                MockTranslatePipe
            ],
            providers: [
                { provide: AuthLinkedinService, useClass: MockAuthLinkedinService },
                { provide: ModalService, useClass: MockModalService }
            ]
        }).overrideComponent(LinkedinConnectComponent, {
            set: {
                imports: [MockAlgoIconComponent, MockStdActionMenuWithPopoverComponent, MockTranslatePipe]
            }
        }).compileComponents();

        authLinkedinService = TestBed.inject(AuthLinkedinService) as unknown as MockAuthLinkedinService;
        modalService = TestBed.inject(ModalService) as unknown as MockModalService;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LinkedinConnectComponent);
        component = fixture.componentInstance;
        modalService.open.calls.reset();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initial State', () => {
        it('should initialize as disconnected', () => {
            expect(component.__connected).toBe(false);
            expect(component.__name).toBe('');
            expect(component.__picture).toBe('assets/images/profile_placeholder.svg');
        });

        it('should initialize showImage as true', () => {
            expect(component.showImage).toBe(true);
        });
    });

    describe('user setter - Business Logic', () => {
        it('should set connected to true when user is provided', () => {
            component.user = mockUser;
            expect(component.__connected).toBe(true);
        });

        it('should set connected to false when user is undefined', () => {
            component.user = undefined;
            expect(component.__connected).toBe(false);
        });

        it('should set name from UserUtils when user is provided', () => {
            component.user = mockUser;
            expect(component.__name).toBe(UserUtils.getUserFullName(mockUser));
        });

        it('should set name to empty string when user is undefined', () => {
            component.user = mockUser;
            component.user = undefined;
            expect(component.__name).toBe('');
        });

        it('should set picture from user when provided', () => {
            component.user = mockUser;
            expect(component.__picture).toBe('https://example.com/picture.jpg');
        });

        it('should call markForCheck when user is set', () => {
            const changeDetectorRef = (component as any)._cd;
            spyOn(changeDetectorRef, 'markForCheck');

            component.user = mockUser;

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });

    describe('ngOnInit - Subscription Logic', () => {
        it('should subscribe to getUserInfo$ and update user', () => {
            authLinkedinService.setUser(mockUser);
            fixture.detectChanges();

            expect(component.__connected).toBe(true);
            expect(component.__name).toBe(UserUtils.getUserFullName(mockUser));
        });

        it('should update state when user logs out', () => {
            authLinkedinService.setUser(mockUser);
            fixture.detectChanges();
            expect(component.__connected).toBe(true);

            authLinkedinService.disconnect();
            fixture.detectChanges();

            expect(component.__connected).toBe(false);
            expect(component.__name).toBe('');
        });

        it('should unsubscribe on component destroy', () => {
            const initialConnected = component.__connected;

            component.ngOnDestroy();

            authLinkedinService.setUser(mockUser);

            expect(component.__connected).toBe(initialConnected);
        });
    });

    describe('openLoginModal method', () => {
        it('should call modalService.open with LinkedinLoginModalComponent', () => {
            component.openLoginModal();

            expect(modalService.open).toHaveBeenCalledWith(LinkedinLoginModalComponent, 'small');
        });
    });

    describe('logout method', () => {
        it('should call authLinkedinService.disconnect', () => {
            spyOn(authLinkedinService, 'disconnect');

            component.logout();

            expect(authLinkedinService.disconnect).toHaveBeenCalled();
        });
    });

    describe('edit method', () => {
        it('should call modalService.open with EditModalComponent', () => {
            component.edit();

            expect(modalService.open).toHaveBeenCalledWith(EditModalComponent, 'small-full-height', {});
        });
    });

    describe('updateShowImage method', () => {
        it('should set showImage to false', () => {
            expect(component.showImage).toBe(true);

            component.updateShowImage();

            expect(component.showImage).toBe(false);
        });

        it('should call markForCheck', () => {
            const changeDetectorRef = (component as any)._cd;
            spyOn(changeDetectorRef, 'markForCheck');

            component.updateShowImage();

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });

    describe('Actions - Callbacks', () => {
        it('should have 2 actions defined', () => {
            expect(component.__actions.length).toBe(2);
        });

        it('should execute edit when first action callback is called', () => {
            component.__actions[0].callback();

            expect(modalService.open).toHaveBeenCalledWith(EditModalComponent, 'small-full-height', {});
        });

        it('should execute logout when second action callback is called', () => {
            spyOn(authLinkedinService, 'disconnect');

            component.__actions[1].callback();

            expect(authLinkedinService.disconnect).toHaveBeenCalled();
        });
    });

    describe('Conditional Rendering', () => {
        it('should display login button when disconnected', () => {
            fixture.detectChanges();

            const loginDiv = fixture.nativeElement.querySelector('.connect');
            expect(loginDiv).toBeTruthy();
        });

        it('should display StdActionMenuWithPopover when connected', () => {
            authLinkedinService.setUser(mockUser);
            fixture.detectChanges();

            const actionsMenu = fixture.debugElement.query(By.directive(MockStdActionMenuWithPopoverComponent));
            expect(actionsMenu).toBeTruthy();
        });

        it('should not display StdActionMenuWithPopover when disconnected', () => {
            fixture.detectChanges();

            const actionsMenu = fixture.debugElement.query(By.directive(MockStdActionMenuWithPopoverComponent));
            expect(actionsMenu).toBeFalsy();
        });
    });
});
