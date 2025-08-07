//REFACTOR in future to use pg pool for better connection management
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

if(process.env.NODE_ENV !== 'production') {
  // Load environment variables from .env file in development
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

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
  throw new Error(
    'Database connection info is missing. Please set DATABASE_URL or all DB_USER, DB_PASS, DB_HOST, DB_PORT, and DB_NAME in your .env'
  );
}

// --- Create a function to handle reconnects ---
function createClient() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  client.connect()
    .then(() => console.log('✅ Database connected successfully'))
    .catch(err => console.error('❌ Initial DB connection error:', err, 'Stack Trace:', err.stack));

  // --- Handle unexpected errors ---
  client.on('error', (err) => {
    console.error('⚠️ PostgreSQL client error (will attempt reconnect):', err.message);

    // Close existing client and reconnect after a short delay
    client.end().catch(() => {});
    setTimeout(() => {
      dbClient = createClient(); // Recreate and reconnect
    }, 5000); // 5s delay before retry
  });

  return client;
}

// Start with a client
let dbClient = createClient();

export default dbClient;



