import { Test, TestingModule } from '@nestjs/testing';
import { GetSourcesService } from './get-sources.service';

describe('GetSourcesService', () => {
  let service: GetSourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetSourcesService],
    }).compile();

    service = module.get<GetSourcesService>(GetSourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
