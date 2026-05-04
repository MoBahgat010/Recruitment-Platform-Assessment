import { IsBoolean, IsEnum, IsOptional } from "class-validator"
import { CandidateStatus } from "../enums/candidate-status.enum"

export class UpdateCandidateDTO {
    @IsOptional()
    @IsEnum(CandidateStatus)
    status?: CandidateStatus
    
    @IsOptional()
    @IsBoolean()
    shortlisted?: boolean
    
    @IsOptional()
    @IsBoolean()
    rejected?: boolean
}