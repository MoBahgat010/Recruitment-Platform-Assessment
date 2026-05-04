import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { CandidateStatus } from "../enums/candidate-status.enum";
import { AuditLog } from "../interfaces/audit-log.interface";

@Entity()
export class Candidate {
    @PrimaryColumn()
    id: string

    @Column()
    fullName: string

    @Column()
    headline: string

    @Column({ name: "location", type: "varchar" })
    location: string

    @Column({ name: "years_of_experience", type: "int", default: 0 })
    yearsOfExperience: number

    @Column({ name: "skills", type: "varchar", array: true })
    skills: string[]

    @Column()
    availability: string

    @UpdateDateColumn()
    updatedAt: Date

    @Column({ name: "status", type: "enum", enum: CandidateStatus })
    status: CandidateStatus

    @Column({ name: "shortlisted", type: "boolean" })
    shortlisted: boolean

    @Column({ name: "rejected", type: "boolean" })
    rejected: boolean

    @Column({ name: "score", type: "float", default: 0 })
    score: number

    @Column({ name: "languages", type: "varchar", array: true, default: [] })
    languages: string[]

    @Column({ name: "projects", type: "jsonb", default: [] })
    projects: Record<string, any>[]

    @Column({ name: "audit-logs", type: "jsonb", default: [] })
    auditLogs: AuditLog[]
}