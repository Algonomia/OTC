import { TestBed } from '@angular/core/testing';

import { SourceFetcherService } from './source-fetcher.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('SourceFetcherService', () => {
    let service: SourceFetcherService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(SourceFetcherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
