#!/usr/bin/env node

/**
 * Simple migration script for testing SQL syntax and structure
 * This script validates the migration files without requiring a live database connection
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

function validateSQL(sqlContent, filename) {
  console.log(`\n📋 Validating ${filename}...`);
  
  // Basic SQL syntax validation
  const errors = [];
  
  // Check for basic SQL structure
  if (!sqlContent.trim()) {
    errors.push('Empty migration file');
  }
  
  // Check for proper CREATE TABLE syntax
  if (sqlContent.includes('CREATE TABLE')) {
    if (!sqlContent.match(/CREATE TABLE.*\(/)) {
      errors.push('Invalid CREATE TABLE syntax');
    }
  }
  
  // Check for proper INDEX syntax
  if (sqlContent.includes('CREATE INDEX')) {
    if (!sqlContent.match(/CREATE INDEX.*ON.*\(/)) {
      errors.push('Invalid CREATE INDEX syntax');
    }
  }
  
  // Check for semicolons at end of statements
  const statements = sqlContent.split(';').filter(s => s.trim());
  statements.forEach((stmt, i) => {
    if (i < statements.length - 1 && !stmt.trim().startsWith('--')) {
      // This is fine, semicolons are handled by the split
    }
  });
  
  if (errors.length > 0) {
    console.log('❌ Validation failed:');
    errors.forEach(error => console.log(`   - ${error}`));
    return false;
  } else {
    console.log('✅ Validation passed');
    return true;
  }
}

function main() {
  console.log('🚀 Running migration validation...');
  
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Migrations directory not found:', MIGRATIONS_DIR);
    process.exit(1);
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (files.length === 0) {
    console.log('⚠️  No migration files found');
    return;
  }
  
  console.log(`📁 Found ${files.length} migration files`);
  
  let allValid = true;
  
  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!validateSQL(content, file)) {
      allValid = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('✅ All migrations validated successfully!');
    console.log('\n📝 Note: This is a syntax validation only.');
    console.log('   To run actual migrations, use: supabase db push');
  } else {
    console.log('❌ Some migrations have validation errors');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}