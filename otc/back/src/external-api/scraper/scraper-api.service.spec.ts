import { Test, TestingModule } from '@nestjs/testing';
import { ScrapApiService } from './scraper-api.service';

describe('ScrapApiService', () => {
  let service: ScrapApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapApiService],
    }).compile();

    service = module.get<ScrapApiService>(ScrapApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
