import { Test, TestingModule } from '@nestjs/testing';
import { FileMetaService } from './file-meta.service';

describe('FileMetaService', () => {
  let service: FileMetaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileMetaService],
    }).compile();

    service = module.get<FileMetaService>(FileMetaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
