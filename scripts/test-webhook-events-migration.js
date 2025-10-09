#!/usr/bin/env node

/**
 * Test script to validate the webhook_events migration against requirements
 * Requirements: 1.2, 1.6 from the spec
 */

const fs = require('fs');
const path = require('path');

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20250108000001_create_webhook_events.sql');

function testWebhookEventsMigration() {
  console.log('🧪 Testing webhook_events migration...\n');
  
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('❌ Migration file not found:', MIGRATION_FILE);
    process.exit(1);
  }
  
  const content = fs.readFileSync(MIGRATION_FILE, 'utf8');
  
  const tests = [
    {
      name: 'Table creation',
      test: () => content.includes('CREATE TABLE IF NOT EXISTS webhook_events'),
      requirement: '1.6 - Record webhook events in database'
    },
    {
      name: 'Primary key (id)',
      test: () => content.includes('id UUID PRIMARY KEY DEFAULT gen_random_uuid()'),
      requirement: '1.6 - Unique identifier for each record'
    },
    {
      name: 'Event ID field with unique constraint',
      test: () => content.includes('event_id TEXT UNIQUE NOT NULL'),
      requirement: '1.2 - Check for duplicate events'
    },
    {
      name: 'Event type field',
      test: () => content.includes('event_type TEXT NOT NULL'),
      requirement: '1.6 - Track event types'
    },
    {
      name: 'Processed timestamp',
      test: () => content.includes('processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()'),
      requirement: '1.6 - Track when events were processed'
    },
    {
      name: 'Status field with check constraint',
      test: () => content.includes("status TEXT NOT NULL CHECK (status IN ('success', 'failed'))"),
      requirement: '1.6 - Track processing status'
    },
    {
      name: 'Error message field',
      test: () => content.includes('error_message TEXT'),
      requirement: '1.6 - Store error details for debugging'
    },
    {
      name: 'Payload field',
      test: () => content.includes('payload JSONB'),
      requirement: '1.6 - Store full webhook payload'
    },
    {
      name: 'Created timestamp',
      test: () => content.includes('created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()'),
      requirement: '1.6 - Track record creation time'
    },
    {
      name: 'Index on event_id',
      test: () => content.includes('CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id)'),
      requirement: '1.2 - Efficient duplicate checking'
    },
    {
      name: 'Index on created_at',
      test: () => content.includes('CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at)'),
      requirement: 'Efficient querying by creation time'
    },
    {
      name: 'Table comment',
      test: () => content.includes("COMMENT ON TABLE webhook_events IS 'Tracks processed webhook events for idempotency and debugging'"),
      requirement: 'Documentation'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    const result = test.test();
    if (result) {
      console.log(`✅ ${test.name}`);
      console.log(`   📋 ${test.requirement}\n`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   📋 ${test.requirement}\n`);
      failed++;
    }
  });
  
  console.log('='.repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Migration meets requirements.');
    console.log('\n📝 Requirements satisfied:');
    console.log('   ✅ 1.2 - Event deduplication capability');
    console.log('   ✅ 1.6 - Webhook event recording');
    console.log('\n🚀 Migration is ready for deployment!');
  } else {
    console.log('❌ Some tests failed. Please review the migration.');
    process.exit(1);
  }
}

if (require.main === module) {
  testWebhookEventsMigration();
}