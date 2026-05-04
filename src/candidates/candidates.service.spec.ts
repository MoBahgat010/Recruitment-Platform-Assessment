import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Candidate } from './entities/candidiate.entity';
import { PaginationService } from '../shared/pagination/pagination.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationQueryDTO } from '../shared/pagination/pagination-query.dto';
import { CandidateStatus } from './enums/candidate-status.enum';

describe('CandidatesService', () => {
  let service: CandidatesService;
  let repository: any;
  let paginationService: any;

  const mockRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  };



  const mockPaginationService = {
    applyFilters: jest.fn(),
    paginate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: mockRepository,
        },
        {
          provide: PaginationService,
          useValue: mockPaginationService,
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    repository = module.get(getRepositoryToken(Candidate));
    paginationService = module.get(PaginationService);

    jest.clearAllMocks();
  });

  describe('listCandidates', () => {
    const dto: PaginationQueryDTO = { page: 1, pageSize: 10 };
    const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 } };

    it('should fetch from DB', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({} as any);
      mockPaginationService.paginate.mockResolvedValue(mockResult);

      const result = await service.listCandidates(dto);

      expect(paginationService.paginate).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateCandidate', () => {
    const id = '1';
    const updateDto = { status: CandidateStatus.HIRED, shortlisted: true };
    const existingCandidate = { 
        id, 
      status: CandidateStatus.OPEN_TO_WORK,
        shortlisted: false, 
        rejected: false,
        auditLogs: [] 
    };

    it('should update candidate', async () => {
      mockRepository.findOneBy.mockResolvedValue(existingCandidate);
      mockRepository.merge.mockReturnValue({ ...existingCandidate, ...updateDto });
      mockRepository.save.mockResolvedValue({ ...existingCandidate, ...updateDto });

      await service.updateCandidate(id, updateDto);

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if less than 2 fields updated', async () => {
      const smallUpdate = { status: CandidateStatus.INTERVIWEING };
      mockRepository.findOneBy.mockResolvedValue(existingCandidate);

      await expect(service.updateCandidate(id, smallUpdate)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if candidate does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateCandidate(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCandidateById', () => {
    it('should return candidate if found', async () => {
      const candidate = { id: '1', fullName: 'John Doe' };
      mockRepository.findOne.mockResolvedValue(candidate);

      const result = await service.getCandidateById('1');

      expect(result).toEqual(candidate);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getCandidateById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRelatedCandidates', () => {
    const id = '1';
    const targetCandidate = {
      id,
      location: 'Cairo',
      skills: ['NodeJS', 'TypeScript'],
      yearsOfExperience: 5,
    };

    it('should return related candidates', async () => {
      mockRepository.findOne.mockResolvedValue(targetCandidate);
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
      } as any);
      mockPaginationService.paginate.mockResolvedValue({ data: [], meta: {} });

      const result = await service.getRelatedCandidates(id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(paginationService.paginate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if target candidate not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getRelatedCandidates(id)).rejects.toThrow(NotFoundException);
    });
  });
});
