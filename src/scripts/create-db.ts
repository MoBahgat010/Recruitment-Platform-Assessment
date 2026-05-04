import { Client } from 'pg';
import { getDatabaseConfig } from '../database/datasource';

async function createDatabase() {
    const config = getDatabaseConfig() as any;
    const targetDb = config.database;
    
    const client = new Client({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: 'postgres',
    });

    try {
        await client.connect();
        
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${targetDb}'`);
        
        if (res.rowCount === 0) {
            console.log(`Database "${targetDb}" does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${targetDb}"`);
            console.log(`Database "${targetDb}" created successfully.`);
        } else {
            console.log(`Database "${targetDb}" already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createDatabase();
