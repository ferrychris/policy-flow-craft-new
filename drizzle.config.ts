import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Get the database URL from environment variables
const databaseUrl = process.env.VITE_SUPABASE_DB_URL;

if (!databaseUrl) {
  throw new Error('VITE_SUPABASE_DB_URL is not set in environment variables');
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  tablesFilter: ['public.*'],
  verbose: true,
  strict: true,
} satisfies Config;
