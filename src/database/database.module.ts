import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './datasource';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...getDatabaseConfig(),
            autoLoadEntities: true,
        }),
    ],
})
export class DatabaseModule {}
