import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UpdateCandidateDTO } from './dto/update-candidate.dto';
import { PaginationQueryDTO } from '../shared/pagination/pagination-query.dto';
import { CandidateResponseDTO } from './dto/candidate-response.dto';
import { CandidatePaginationResponseDTO } from '../shared/pagination/pagination.resposne';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
    constructor(
        private readonly candidatesService: CandidatesService,
    ) {}

    @Get(":id")
    async getCandidateById(
        @Param("id") id: string,
    ): Promise<CandidateResponseDTO> {
        return this.candidatesService.getCandidateById(id);
    }

    @Patch(":id")
    async updateCandidate(
        @Param("id") id: string,
        @Body() candidate: UpdateCandidateDTO,
    ): Promise<CandidateResponseDTO> {
        return this.candidatesService.updateCandidate(id, candidate);
    }

    @Get()
    async listCandidates(
        @Query() paginationQuery: PaginationQueryDTO,
    ): Promise<CandidatePaginationResponseDTO> {
        return this.candidatesService.listCandidates(paginationQuery);
    }

    @Get(":id/related")
    async getRelatedCandidates(
        @Param("id") id: string,
    ): Promise<CandidatePaginationResponseDTO> {
        return this.candidatesService.getRelatedCandidates(id);
    }
}
