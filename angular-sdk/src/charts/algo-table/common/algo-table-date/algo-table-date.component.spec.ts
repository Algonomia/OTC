import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableDateComponent } from './algo-table-date.component';

describe('AlgoTableDateComponent', () => {
    let component: AlgoTableDateComponent;
    let fixture: ComponentFixture<AlgoTableDateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableDateComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableDateComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept date input', () => {
            const testDate = new Date(2024, 0, 15);
            fixture.componentRef.setInput('date', testDate);
            expect(component.date).toBe(testDate);
        });

        it('should accept undefined date', () => {
            fixture.componentRef.setInput('date', undefined);
            expect(component.date).toBeUndefined();
        });

        it('should have undefined as default value', () => {
            expect(component.date).toBeUndefined();
        });
    });

    describe('Template Rendering', () => {
        describe('date formatting', () => {
            it('should display date in dd/MM/yyyy format', () => {
                const testDate = new Date(2024, 0, 15);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/01/2024');
            });

            it('should format date with single digit day', () => {
                const testDate = new Date(2024, 5, 5);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('05/06/2024');
            });

            it('should format date with single digit month', () => {
                const testDate = new Date(2024, 0, 20);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('20/01/2024');
            });

            it('should format date at end of year', () => {
                const testDate = new Date(2024, 11, 31);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('31/12/2024');
            });

            it('should format date at beginning of year', () => {
                const testDate = new Date(2024, 0, 1);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('01/01/2024');
            });

            it('should format leap year date', () => {
                const testDate = new Date(2024, 1, 29);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('29/02/2024');
            });

            it('should format date from different century', () => {
                const testDate = new Date(1999, 11, 31);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('31/12/1999');
            });

            it('should format future date', () => {
                const testDate = new Date(2030, 6, 15);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/07/2030');
            });
        });

        describe('undefined date handling', () => {
            it('should display empty when date is undefined', () => {
                fixture.componentRef.setInput('date', undefined);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('');
            });

            it('should display empty when date is not set', () => {
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('');
            });

            it('should display empty when date is null', () => {
                fixture.componentRef.setInput('date', null as any);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('');
            });
        });

        describe('dynamic updates', () => {
            it('should update display when date changes', () => {
                const initialDate = new Date(2024, 0, 15);
                fixture.componentRef.setInput('date', initialDate);
                fixture.detectChanges();

                let content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/01/2024');

                const updatedDate = new Date(2024, 5, 20);
                fixture.componentRef.setInput('date', updatedDate);
                fixture.detectChanges();

                content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('20/06/2024');
            });

            it('should clear display when date becomes undefined', () => {
                const testDate = new Date(2024, 0, 15);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                let content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/01/2024');

                fixture.componentRef.setInput('date', undefined);
                fixture.detectChanges();

                content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('');
            });

            it('should display date when changing from undefined to date', () => {
                fixture.componentRef.setInput('date', undefined);
                fixture.detectChanges();

                let content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('');

                const testDate = new Date(2024, 0, 15);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/01/2024');
            });
        });

        describe('edge cases', () => {
            it('should handle date created from timestamp', () => {
                const timestamp = 1705276800000;
                const testDate = new Date(timestamp);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toContain('/01/2024');
            });

            it('should handle date created from string', () => {
                const testDate = new Date('2024-01-15');
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toContain('/01/2024');
            });

            it('should handle today date', () => {
                const today = new Date();
                fixture.componentRef.setInput('date', today);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = today.getFullYear();

                expect(content).toBe(`${day}/${month}/${year}`);
            });

            it('should ignore time component of date', () => {
                const testDate = new Date(2024, 0, 15, 14, 30, 45);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/01/2024');
            });

            it('should handle date at midnight', () => {
                const testDate = new Date(2024, 0, 15, 0, 0, 0);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/01/2024');
            });

            it('should handle date at end of day', () => {
                const testDate = new Date(2024, 0, 15, 23, 59, 59);
                fixture.componentRef.setInput('date', testDate);
                fixture.detectChanges();

                const content = fixture.nativeElement.textContent.trim();
                expect(content).toBe('15/01/2024');
            });
        });
    });
});
