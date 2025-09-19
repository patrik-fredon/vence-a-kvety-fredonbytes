#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs all pending migrations in the correct order
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations';

async function createMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (error) {
    console.error('❌ Failed to create migrations table:', error);
    throw error;
  }
}

async function getExecutedMigrations() {
  const { data, error } = await supabase
    .from(MIGRATIONS_TABLE)
    .select('filename')
    .order('filename');

  if (error && error.code !== 'PGRST116') { // Table doesn't exist
    console.error('❌ Failed to get executed migrations:', error);
    throw error;
  }

  return data ? data.map(row => row.filename) : [];
}

async function executeMigration(filename, sql) {
  console.log(`🔄 Executing migration: ${filename}`);

  // Execute the migration SQL
  const { error: sqlError } = await supabase.rpc('exec_sql', { sql });

  if (sqlError) {
    console.error(`❌ Migration failed: ${filename}`, sqlError);
    throw sqlError;
  }

  // Record the migration as executed
  const { error: recordError } = await supabase
    .from(MIGRATIONS_TABLE)
    .insert({ filename });

  if (recordError) {
    console.error(`❌ Failed to record migration: ${filename}`, recordError);
    throw recordError;
  }

  console.log(`✅ Migration completed: ${filename}`);
}

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    // Create migrations tracking table
    await createMigrationsTable();

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`📋 Found ${executedMigrations.length} executed migrations`);

    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'src', 'lib', 'supabase', 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 No migrations directory found, creating...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Execute pending migrations
    let executedCount = 0;
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        const filePath = path.join(migrationsDir, filename);
        const sql = fs.readFileSync(filePath, 'utf8');

        await executeMigration(filename, sql);
        executedCount++;
      } else {
        console.log(`⏭️  Skipping already executed: ${filename}`);
      }
    }

    if (executedCount === 0) {
      console.log('✨ All migrations are up to date!');
    } else {
      console.log(`✅ Successfully executed ${executedCount} migrations`);
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Add SQL execution function to Supabase if it doesn't exist
async function ensureSqlFunction() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `
  });

  if (error && !error.message.includes('already exists')) {
    // If the function doesn't exist, we need to create it differently
    console.log('Creating SQL execution function...');
    // This would need to be done manually in Supabase dashboard
  }
}

// Run migrations
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
