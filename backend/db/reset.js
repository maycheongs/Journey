// load .env data into process.env
import dotenv from 'dotenv';


// other dependencies
import fs from 'fs';
import chalk from 'chalk';
import { Client } from 'pg';
import path from 'path';
// Calculate the absolute path to the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// PG connection setup
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=disable`;
const client = new Client({ connectionString });

// Loads the schema files from db/schema
const runSchemaFiles = async function () {
  console.log(chalk.cyan(`-> Loading Schema Files ...`));
  const schemaFilenames = fs.readdirSync('./db/schema');

  for (const fn of schemaFilenames) {
    const sql = fs.readFileSync(`./db/schema/${fn}`, 'utf8');
    console.log(`\t-> Running ${chalk.green(fn)}`);
    await client.query(sql);
  }
};

const runSeedFiles = async function () {
  console.log(chalk.cyan(`-> Loading Seeds ...`));
  const schemaFilenames = fs.readdirSync('./db/seeds');

  for (const fn of schemaFilenames) {
    const sql = fs.readFileSync(`./db/seeds/${fn}`, 'utf8');
    console.log(`\t-> Running ${chalk.green(fn)}`);
    await client.query(sql);
  }
};

try {
  console.log(`-> Connecting to PG using ${connectionString} ...`);
  await client.connect();;
  await runSchemaFiles();
  await runSeedFiles();

  await client.end();;
} catch (err) {
  console.error(chalk.red(`Failed due to error: ${err}`));
  await client.end();
}
