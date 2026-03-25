import { Test, TestingModule } from '@nestjs/testing';
import { CreateSourceService } from './create-source.service';

describe('CreateSourceService', () => {
  let service: CreateSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateSourceService],
    }).compile();

    service = module.get<CreateSourceService>(CreateSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
