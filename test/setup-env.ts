import { config } from 'dotenv';

Object.defineProperty(BigInt.prototype, 'toJSON', {
    value(this: bigint) {
        return this.toString();
    },
    configurable: true,
});

config({ quiet: true });

const databaseUrl = process.env.DATABASE_URL_TEST;

if (!databaseUrl) {
    throw new Error('DATABASE_URL_TEST is not set');
}

process.env.DATABASE_URL = databaseUrl;
