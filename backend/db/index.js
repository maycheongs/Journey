import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
// Calculate the absolute path to the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=disable`;

const client = new pg.Client({
  connectionString: connectionString || process.env.DATABASE_URL,
});

console.log(`Connected to ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
client.connect()
.then(() => console.log('Database connected successfully'))
.catch(err => console.error('Database connection error:', err));

export default client;

