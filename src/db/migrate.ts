import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  console.log('Connecting to database...');
  const connection = postgres(databaseUrl, { max: 1 });
  const db = drizzle(connection);

  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations().catch(console.error);
