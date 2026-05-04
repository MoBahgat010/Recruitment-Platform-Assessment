import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCandidatesTable1777844467136 implements MigrationInterface {
    name = 'CreateCandidatesTable1777844467136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."candidate_status_enum" AS ENUM('Open to work', 'Interviewing', 'Hired')`);
        await queryRunner.query(`CREATE TABLE "candidate" ("id" character varying NOT NULL, "fullName" character varying NOT NULL, "headline" character varying NOT NULL, "location" character varying NOT NULL, "years_of_experience" integer NOT NULL DEFAULT '0', "skills" character varying array NOT NULL, "availability" character varying NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."candidate_status_enum" NOT NULL, "shortlisted" boolean NOT NULL, "rejected" boolean NOT NULL, "score" double precision NOT NULL DEFAULT '0', "languages" character varying array NOT NULL DEFAULT '{}', "projects" jsonb NOT NULL DEFAULT '[]', "audit-logs" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_b0ddec158a9a60fbc785281581b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "candidate"`);
        await queryRunner.query(`DROP TYPE "public"."candidate_status_enum"`);
    }

}
