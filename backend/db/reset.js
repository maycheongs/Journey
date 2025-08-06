// REFACTOR in future to use pg pool for better connection management
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import client from './index.js'; 

// --- Helper to run all SQL files in a folder ---
const runSqlFilesFromFolder = async (folderName, description) => {
  console.log(chalk.cyan(`-> Loading ${description}...`));
  const folderPath = path.resolve(`./db/${folderName}`);
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\t-> Running ${chalk.green(file)}`);
    await client.query(sql);
  }
};

// --- Drop all tables ---
const dropAllTables = async () => {
  console.log(chalk.yellow('\n-> Dropping all tables...'));
  const { rows } = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `);

  if (rows.length === 0) {
    console.log(chalk.gray('No tables found.'));
    return;
  }

  // Disable FK checks, drop tables, re-enable FK checks
  await client.query('SET session_replication_role = replica;');
  for (const { tablename } of rows) {
    console.log(`\t-> Dropping ${chalk.red(tablename)}`);
    await client.query(`DROP TABLE IF EXISTS "${tablename}" CASCADE;`);
  }
  await client.query('SET session_replication_role = DEFAULT;');
  console.log(chalk.green('All tables dropped.\n'));
};

// --- Full reset process ---
const resetDatabase = async () => {
  try {
    console.log(chalk.yellow(`\n-> Resetting and seeding the database...\n`));

    await dropAllTables();
    await runSqlFilesFromFolder('schema', 'Schema Files');
    await runSqlFilesFromFolder('seeds', 'Seed Files');

    console.log(chalk.green(`\nDatabase reset and seeded successfully!`));
  } catch (err) {
    console.error(chalk.red(`Failed due to error:\n`), err);
  } finally {
    await client.end(); // ✅ Always close the connection
    console.log(chalk.gray('Connection closed.'));
  }
};

// Run the script
resetDatabase();
