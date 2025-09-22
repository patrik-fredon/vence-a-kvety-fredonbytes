#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Next.js cache and build artifacts...');

const pathsToDelete = [
  '.next',
  'node_modules/.cache',
  '.vercel',
  'out'
];

pathsToDelete.forEach(dirPath => {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath)) {
    console.log(`Deleting ${dirPath}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('✅ Cache cleared successfully!');
console.log('💡 Now run: npm run dev');
console.log('💡 Also clear your browser cache and cookies for localhost:3000');
