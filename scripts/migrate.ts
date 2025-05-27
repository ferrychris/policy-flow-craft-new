import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function main() {
  const databaseUrl = process.env.VITE_SUPABASE_DB_URL;

  if (!databaseUrl) {
    throw new Error('VITE_SUPABASE_DB_URL is not set in environment variables');
  }

  console.log('Connecting to database...');
  const connection = postgres(databaseUrl, { max: 1 });
  const db = drizzle(connection);

  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

main().catch(console.error);
