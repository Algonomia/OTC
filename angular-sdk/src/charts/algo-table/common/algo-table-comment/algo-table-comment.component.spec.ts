import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableCommentComponent } from './algo-table-comment.component';

describe('AlgoTableCommentComponent', () => {
    let component: AlgoTableCommentComponent;
    let fixture: ComponentFixture<AlgoTableCommentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableCommentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableCommentComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Conditional Rendering', () => {
        it('should render when text is provided', () => {
            fixture.componentRef.setInput('text', 'Comment text');
            fixture.detectChanges();

            const commentDiv = fixture.nativeElement.querySelector('.comment');
            expect(commentDiv).toBeTruthy();
        });

        it('should not render when text is empty', () => {
            fixture.componentRef.setInput('text', '');
            fixture.detectChanges();

            const commentDiv = fixture.nativeElement.querySelector('.comment');
            expect(commentDiv).toBeFalsy();
        });

        it('should not render when text is not provided', () => {
            fixture.detectChanges();

            const commentDiv = fixture.nativeElement.querySelector('.comment');
            expect(commentDiv).toBeFalsy();
        });
    });
});
