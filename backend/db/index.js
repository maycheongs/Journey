import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
// Calculate the absolute path to the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const {
  DATABASE_URL,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

let connectionString;

if (DATABASE_URL) {
  connectionString = DATABASE_URL;
} else if (DB_USER && DB_PASS && DB_HOST && DB_PORT && DB_NAME) {
  connectionString = `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable`;
} else {
  throw new Error('Database connection info is missing. Please set DATABASE_URL or all DB_USER, DB_PASS, DB_HOST, DB_PORT, and DB_NAME in your .env');
}

const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Supabase uses self-signed certs
  },
});

console.log(`Connecting to ${DB_NAME || 'database'} on ${DB_HOST || 'host'}`);
client.connect()
.then(() => console.log('Database connected successfully'))
.catch(err => console.error('Database connection error:', err));

export default client;

