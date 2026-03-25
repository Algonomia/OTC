import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StdActionsMenuComponent, IAction, CheckActionConditionPipe } from './std-actions-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StdActionsMenuComponent', () => {
    let component: StdActionsMenuComponent<[string, number]>;
    let fixture: ComponentFixture<StdActionsMenuComponent<[string, number]>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                StdActionsMenuComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StdActionsMenuComponent<[string, number]>);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize with default empty actions array', () => {
            expect(component.actions).toEqual([]);
        });

        it('should accept actions array with multiple items', () => {
            const actions: IAction<[string, number]>[] = [
                { title: 'Action 1', callback: () => {} },
                { title: 'Action 2', callback: () => {} },
                { title: 'Action 3', callback: () => {} }
            ];

            component.actions = actions;

            expect(component.actions!.length).toBe(3);
        });
    });

    describe('Action handling', () => {
        it('should call action callback with correct parameters', () => {
            const mockCallback = jasmine.createSpy('callback');
            const action: IAction<[string, number]> = {
                title: 'Test Action',
                callback: mockCallback
            };

            component.action_inputs = ['test', 42];

            component['__callAction'](action);

            expect(mockCallback).toHaveBeenCalledWith('test', 42);
        });

        it('should emit onActionTrigger when action is called', () => {
            const emitSpy = spyOn(component.onActionTrigger, 'emit');
            const action: IAction<[string, number]> = {
                title: 'Test Action',
                callback: () => {}
            };

            component.action_inputs = ['test', 42];

            component['__callAction'](action);

            expect(emitSpy).toHaveBeenCalled();
        });

        it('should handle multiple action inputs', () => {
            const mockCallback = jasmine.createSpy('callback');
            const action: IAction<[string, number]> = {
                title: 'Test Action',
                callback: mockCallback
            };

            component.action_inputs = ['hello', 999];

            component['__callAction'](action);

            expect(mockCallback).toHaveBeenCalledWith('hello', 999);
        });
    });

    describe('Integration scenarios', () => {
        it('should properly execute action in real scenario', () => {
            let executedValue = '';

            const action: IAction<[string, number]> = {
                title: 'Update Value',
                callback: (name: string, id: number) => {
                    executedValue = `${name}-${id}`;
                }
            };

            component.actions = [action];
            component.action_inputs = ['user', 123];

            component['__callAction'](action);

            expect(executedValue).toBe('user-123');
        });
    });

    describe('Edge cases', () => {
        it('should handle callback that throws an error', () => {
            const action: IAction<[string, number]> = {
                title: 'Test Action',
                callback: () => {
                    throw new Error('Callback error');
                }
            };

            component.action_inputs = ['test', 1];

            expect(() => {
                component['__callAction'](action);
            }).toThrow();
        });
    });
});

describe('CheckActionConditionPipe', () => {
    let pipe: CheckActionConditionPipe;

    beforeEach(() => {
        pipe = new CheckActionConditionPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return true when no condition is provided', () => {
        const action: IAction<[]> = {
            title: 'Test Action',
            callback: () => {}
        };

        const result = pipe.transform(action, []);

        expect(result).toBe(true);
    });

    it('should return false when action is falsy', () => {
        const result = pipe.transform(null as unknown as IAction<[]>, []);

        expect(result).toBe(false);
    });

    it('should return true when condition evaluates to true', () => {
        const action: IAction<[boolean]> = {
            title: 'Test Action',
            callback: () => {},
            condition: (value: boolean) => value
        };

        const result = pipe.transform(action, [true]);

        expect(result).toBe(true);
    });

    it('should return false when condition evaluates to false', () => {
        const action: IAction<[boolean]> = {
            title: 'Test Action',
            callback: () => {},
            condition: (value: boolean) => value
        };

        const result = pipe.transform(action, [false]);

        expect(result).toBe(false);
    });

    it('should call condition with correct parameters', () => {
        const mockCondition = jasmine.createSpy('condition').and.returnValue(true);
        const action: IAction<[string, number]> = {
            title: 'Test Action',
            callback: () => {},
            condition: mockCondition
        };

        pipe.transform(action, ['test', 123]);

        expect(mockCondition).toHaveBeenCalledWith('test', 123);
    });

    it('should handle complex condition logic', () => {
        const action: IAction<[number]> = {
            title: 'Test Action',
            callback: () => {},
            condition: (value: number) => value > 10 && value < 100
        };

        expect(pipe.transform(action, [50])).toBe(true);
        expect(pipe.transform(action, [5])).toBe(false);
        expect(pipe.transform(action, [150])).toBe(false);
    });
});
