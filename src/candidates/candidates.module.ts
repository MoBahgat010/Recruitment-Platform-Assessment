import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidiate.entity';
import { PaginationService } from '../shared/pagination/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate]),
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, PaginationService]
})
export class CandidatesModule {}
