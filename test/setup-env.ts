import { config } from 'dotenv';

config({ quiet: true });

const databaseUrl = process.env.DATABASE_URL_TEST;

if (!databaseUrl) {
    throw new Error('DATABASE_URL_TEST is not set');
}

process.env.DATABASE_URL = databaseUrl;
