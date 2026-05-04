import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from './entities/candidiate.entity';
import { Not, Repository } from 'typeorm';
import { UpdateCandidateDTO } from './dto/update-candidate.dto';
import { PaginationQueryDTO } from '../shared/pagination/pagination-query.dto';
import { PaginationService } from '../shared/pagination/pagination.service';
import { CandidatePaginationResponseDTO } from '../shared/pagination/pagination.resposne';
import { CandidateResponseDTO } from './dto/candidate-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CandidatesService {
    logger = new Logger(CandidatesService.name);

    constructor(
        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>,
        private readonly paginationService: PaginationService,
    ) {}

    private mapToResponseDTO(candidate: Candidate): CandidateResponseDTO {
        return plainToInstance(CandidateResponseDTO, candidate, {
            excludeExtraneousValues: true,
        });
    }

    async updateCandidate(id: string, candidate: UpdateCandidateDTO): Promise<CandidateResponseDTO> {
        try {
            const candidate_to_update = await this.candidateRepository.findOneBy({ id });
            if (!candidate_to_update) {
                this.logger.warn(`Candidate not found: ${id}`);
                throw new NotFoundException('Candidate not found');
            }

            let fieldsToUpdate = 0;
            if (candidate.status !== undefined && candidate_to_update.status !== candidate.status) {
                fieldsToUpdate++;
            }
            if (candidate.shortlisted !== undefined && candidate_to_update.shortlisted !== candidate.shortlisted) {
                fieldsToUpdate++;
            }
            if (candidate.rejected !== undefined && candidate_to_update.rejected !== candidate.rejected) {
                fieldsToUpdate++;
            }

            if (fieldsToUpdate < 2) {
                throw new BadRequestException('Must update at least 2 of: status, shortlisted, rejected');
            }

            if (candidate.status !== undefined && candidate_to_update.status !== candidate.status) {
                candidate_to_update.auditLogs.push({
                    at: new Date(),
                    action: 'status_changed',
                    from: candidate_to_update.status,
                    to: candidate.status,
                });
            }

            if (candidate.shortlisted !== undefined && candidate_to_update.shortlisted !== candidate.shortlisted) {
                candidate_to_update.auditLogs.push({
                    at: new Date(),
                    action: 'shortlisted_changed',
                    from: candidate_to_update.shortlisted,
                    to: candidate.shortlisted,
                });
            }

            if (candidate.rejected !== undefined && candidate_to_update.rejected !== candidate.rejected) {
                candidate_to_update.auditLogs.push({
                    at: new Date(),
                    action: 'rejected_changed',
                    from: candidate_to_update.rejected,
                    to: candidate.rejected,
                });
            }

            const candidate_to_save = this.candidateRepository.merge(candidate_to_update, candidate);

            const updated = await this.candidateRepository.save(candidate_to_save);
            
            this.logger.log({ msg: 'candidate updated', id, changes: candidate });
            return this.mapToResponseDTO(updated);
        } catch (err) {
            this.logger.error({ msg: 'updateCandidate failed', err, id, payload: candidate });
            if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
            throw new InternalServerErrorException('Failed to update candidate');
        }
    }

    async getCandidateById(id: string): Promise<CandidateResponseDTO> {
        try {
            const candidate = await this.candidateRepository.findOne({ where: { id } });
            if (!candidate) {
                this.logger.warn(`Candidate not found: ${id}`);
                throw new NotFoundException('Candidate not found');
            }
            return this.mapToResponseDTO(candidate);
        } catch (err) {
            this.logger.error({ msg: 'getCandidateById failed', err, id });
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to fetch candidate');
        }
    }

    async listCandidates(dto: PaginationQueryDTO): Promise<CandidatePaginationResponseDTO> {
        try {
            const queryBuilder = this.candidateRepository.createQueryBuilder();

            this.paginationService.applyFilters(queryBuilder, dto);

            const result = await this.paginationService.paginate(
                queryBuilder,
                dto,
                ['updatedAt', 'score', 'yearsOfExperience'],
            );
            this.logger.log({ msg: 'listCandidates result', meta: result.meta });
            return result;
        } catch (err) {
            this.logger.error({ msg: 'listCandidates failed', err, query: dto });
            throw new InternalServerErrorException('Failed to list candidates');
        }
    }

    async getRelatedCandidates(id: string): Promise<CandidatePaginationResponseDTO> {
        try {
            const target = await this.candidateRepository.findOne({ where: { id } });

            if (!target) {
                this.logger.warn(`Candidate not found for related: ${id}`);
                throw new NotFoundException('Candidate not found');
            }

            const queryBuilder = this.candidateRepository.createQueryBuilder();
            queryBuilder.where({ id: Not(id) });
            
            const locationScore = `(CASE WHEN "location" = :targetLocation THEN 20 ELSE 0 END)`;
            
            let skillScore = '0';
            if (target.skills && target.skills.length > 0) {
                skillScore = `(
                    COALESCE(
                        (SELECT COUNT(*) FROM unnest("skills") s WHERE s = ANY(:targetSkills)), 0
                    )::float / ${target.skills.length} * 50
                )`;
            }

            const experienceScore = `(CASE WHEN "years_of_experience" = :targetExp THEN 30 ELSE 0 END)`;

            const totalScore = `${locationScore} + ${skillScore} + ${experienceScore}`;
            
            queryBuilder.addSelect(`${totalScore}`, 'similarityScore');
            queryBuilder.setParameters({
                targetLocation: target.location,
                targetSkills: target.skills,
                targetExp: target.yearsOfExperience,
            });

            queryBuilder.andWhere(`(${totalScore}) > 30`);

            const result = await this.paginationService.paginate(
                queryBuilder,
                { page: 1, pageSize: 10, sort: 'similarityScore', order: 'DESC' as any },
                ['similarityScore', 'updatedAt', 'score', 'yearsOfExperience']
            );
            this.logger.log({ msg: 'relatedCandidates: ', id, meta: result.meta });
            return result;
        } catch (err) {
            this.logger.error({ msg: 'getRelatedCandidates failed', err, id });
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Failed to compute related candidates');
        }
    }
}
