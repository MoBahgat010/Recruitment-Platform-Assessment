import { BadRequestException, Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ILike, ArrayContains } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidiate.entity';
import { PaginationQueryDTO } from './pagination-query.dto';
import {
  CandidatePaginationResponseDTO,
} from './pagination.resposne';
import { SortOrder } from './sort-order.enum';
import { CandidateResponseDTO } from '../../candidates/dto/candidate-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaginationService {
  private mapToResponseDTO(candidate: any): CandidateResponseDTO {
    return plainToInstance(CandidateResponseDTO, candidate, {
      excludeExtraneousValues: true,
    });
  }

  public validatePaginationParams(
    page?: number,
    pageSize?: number,
    sort?: string,
    order?: string,
    validSortFields: string[] = ['fullName', 'score', 'updatedAt'],
  ): void {
    if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
      throw new BadRequestException('Page number must be a positive integer');
    }

    if (pageSize !== undefined && (pageSize < 1 || !Number.isInteger(pageSize))) {
      throw new BadRequestException('Page size must be a positive integer');
    }

    if (sort && !validSortFields.includes(sort)) {
      throw new BadRequestException(
        `Invalid sort field. Allowed values: ${validSortFields.join(', ')}`,
      );
    }

    if (order && !['ASC', 'DESC'].includes(order.toUpperCase())) {
      throw new BadRequestException(
        'Invalid order value. Allowed values: ASC, DESC',
      );
    }
  }

  public applyFilters(
    queryBuilder: SelectQueryBuilder<Candidate>,
    dto: PaginationQueryDTO,
  ): void {
    if (dto.q) {
      queryBuilder.andWhere(
        '("fullName" ILIKE :q OR "headline" ILIKE :q OR :q_raw = ANY("skills"))',
        { q: `%${dto.q}%`, q_raw: dto.q },
      );
    }

    if (dto.location) {
      queryBuilder.andWhere({ location: ILike(`%${dto.location}%`) });
    }

    if (dto.status) {
      queryBuilder.andWhere({ status: dto.status });
    }

    if (dto.availability) {
      queryBuilder.andWhere({ availability: ILike(`%${dto.availability}%`) });
    }

    if (dto.minExp) {
      queryBuilder.andWhere('years_of_experience >= :minExp', { minExp: dto.minExp });
    }

    if (dto.maxExp) {
      queryBuilder.andWhere('years_of_experience <= :maxExp', { maxExp: dto.maxExp });
    }

    if (dto.skill) {
      queryBuilder.andWhere({ skills: ArrayContains([dto.skill]) });
    }
  }

  public async paginate(
    queryBuilder: SelectQueryBuilder<Candidate>,
    dto: PaginationQueryDTO,
    validSortFields: string[] = ['fullName', 'score', 'updatedAt'],
  ): Promise<CandidatePaginationResponseDTO> {
    const { page = 1, pageSize = 10, order = SortOrder.DESC } = dto;
    const sort = dto.sort ?? validSortFields[0];

    this.validatePaginationParams(page, pageSize, dto.sort, order, validSortFields);

    const skip = (page - 1) * pageSize;
    const validSortField = validSortFields.includes(sort) ? sort : validSortFields[0];
    const validSortOrder = order;

    const totalItems = await queryBuilder.getCount();

    if (validSortField === 'similarityScore') {
      queryBuilder.orderBy('"similarityScore"', validSortOrder);
    } else {
      queryBuilder.orderBy(`"${validSortField}"`, validSortOrder);
    }

    queryBuilder.skip(skip).take(pageSize);

    const { entities, raw } = await queryBuilder.getRawAndEntities();
    const totalPages = Math.ceil(totalItems / pageSize);

    const mappedData = entities.map((entity, index) => {
      const rawItem = raw[index];
      if (rawItem && (rawItem.similarityScore !== undefined || rawItem.similarityscore !== undefined)) {
        const score = rawItem.similarityScore ?? rawItem.similarityscore;
        (entity as any).similarityScore = parseFloat(score);
      }
      return this.mapToResponseDTO(entity);
    });

    return {
      data: mappedData,
      meta: {
        total: totalItems,
        totalPages,
        page,
        pageSize,
      },
    };
  }
}