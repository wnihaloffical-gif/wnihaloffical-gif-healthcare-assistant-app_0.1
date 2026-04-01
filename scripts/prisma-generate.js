#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

console.log('[v0] Generating Prisma Client...');

try {
  // Generate Prisma Client
  execSync('npx prisma generate', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  console.log('[v0] Prisma Client generated successfully');

  // Push schema to database
  console.log('[v0] Pushing schema to database...');
  execSync('npx prisma db push --skip-generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, SKIP_ENV_VALIDATION: 'true' },
  });

  console.log('[v0] Database schema synced successfully');
} catch (error) {
  console.error('[v0] Error:', error.message);
  process.exit(1);
}
