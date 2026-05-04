import { CandidateStatus } from "../enums/candidate-status.enum";

export interface AuditLog {
    at: Date;
    action: string;
    from: CandidateStatus | boolean;
    to: CandidateStatus | boolean;
}