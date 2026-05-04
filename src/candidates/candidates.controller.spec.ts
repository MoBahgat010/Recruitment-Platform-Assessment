import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let service: CandidatesService;

  const mockCandidatesService = {
    createCandidate: jest.fn(),
    updateCandidate: jest.fn(),
    getRelatedCandidates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [
        {
          provide: CandidatesService,
          useValue: mockCandidatesService,
        },
      ],
    }).compile();

    controller = module.get<CandidatesController>(CandidatesController);
    service = module.get<CandidatesService>(CandidatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRelatedCandidates', () => {
    it('should call service.getRelatedCandidates', async () => {
      const id = '1';
      await controller.getRelatedCandidates(id);
      expect(service.getRelatedCandidates).toHaveBeenCalledWith(id);
    });
  });
});
