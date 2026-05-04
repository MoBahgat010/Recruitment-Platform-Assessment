import { Expose } from "class-transformer";
import { CandidateStatus } from "../enums/candidate-status.enum";

export class CandidateResponseDTO {
    @Expose()
    id: string;

    @Expose()
    fullName: string;

    @Expose()
    headline: string;

    @Expose()
    location: string;

    @Expose()
    yearsOfExperience: number;

    @Expose()
    skills: string[];

    @Expose()
    availability: string;

    @Expose()
    updatedAt: Date;

    @Expose()
    status: CandidateStatus;

    @Expose()
    shortlisted: boolean;

    @Expose()
    rejected: boolean;
    
    @Expose()
    score: number;
}
