import { TestBed } from '@angular/core/testing';

import { CompletionFetcherService } from './completion-fetcher.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CompletionFetcherService', () => {
    let service: CompletionFetcherService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(CompletionFetcherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
