import { CandidateResponseDTO } from '../../candidates/dto/candidate-response.dto';

export class CandidatePaginationMetaDTO {
  page: number;

  pageSize: number;

  total: number;

  totalPages: number;
}

export class CandidatePaginationResponseDTO {
  data: CandidateResponseDTO[];

  meta: CandidatePaginationMetaDTO;
}