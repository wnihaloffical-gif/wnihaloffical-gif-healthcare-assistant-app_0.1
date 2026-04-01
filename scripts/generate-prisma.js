import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('[v0] Starting Prisma Client generation...');
console.log('[v0] Project root:', projectRoot);

try {
  // Generate Prisma Client
  console.log('[v0] Running: prisma generate');
  execSync('npx prisma generate', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  });
  console.log('[v0] Prisma Client generated successfully!');

  // Push schema to database
  console.log('[v0] Running: prisma db push');
  execSync('npx prisma db push --skip-generate', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  });
  console.log('[v0] Database schema synced successfully!');

  process.exit(0);
} catch (error) {
  console.error('[v0] Error during Prisma setup:', error.message);
  process.exit(1);
}
