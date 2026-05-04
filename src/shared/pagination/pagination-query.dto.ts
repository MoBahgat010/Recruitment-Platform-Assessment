import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { SortOrder } from './sort-order.enum';
import { CandidateStatus } from '../../candidates/enums/candidate-status.enum';

export class PaginationQueryDTO {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    pageSize?: number;

    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    skill?: string;

    @IsOptional()
    @IsEnum(CandidateStatus)
    status?: CandidateStatus;

    @IsOptional()
    @IsString()
    availability?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minExp?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    maxExp?: number;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsEnum(SortOrder)
    order?: SortOrder;
}