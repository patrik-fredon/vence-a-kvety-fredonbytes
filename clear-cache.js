// Simple script to clear Redis cache
const { createClient } = require('redis');

async function clearCache() {
  try {
    const client = createClient({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379'
    });

    await client.connect();
    await client.flushAll();
    console.log('Cache cleared successfully');
    await client.disconnect();
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

clearCache();
