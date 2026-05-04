import { DataSource } from 'typeorm';
import { Candidate } from '../candidates/entities/candidiate.entity';
import { getDatabaseConfig } from '../database/datasource';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
    const dataSource = new DataSource({
        ...getDatabaseConfig(),
    });

    try {
        await dataSource.initialize();
        console.log('Data Source has been initialized!');

        const jsonPath = path.join(__dirname, 'candidates.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const candidatesData = JSON.parse(rawData);

        const repository = dataSource.getRepository(Candidate);

        const entityFields = [
            'id',
            'fullName',
            'headline',
            'location',
            'yearsOfExperience',
            'skills',
            'availability',
            'updatedAt',
            'status',
            'score',
            'languages',
            'projects',
        ];

        const filteredData = candidatesData.map((data: any) => {
            const filtered: any = {};
            entityFields.forEach((field) => {
                if (data[field] !== undefined) {
                    filtered[field] = data[field];
                }
            });
            
            filtered.shortlisted = false;
            filtered.rejected = false;
            filtered.auditLogs = [];
            return filtered;
        });

        await repository.clear();
        console.log('Existing candidates cleared.');

        await repository.save(filteredData);
        console.log(`${filteredData.length} candidates loaded into the database.`);

    } catch (err) {
        console.error('Error during data seeding:', err);
    } finally {
        await dataSource.destroy();
    }
}

seed();
