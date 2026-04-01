import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('[v0] Setting up Prisma...');
console.log('[v0] Project root:', projectRoot);

async function setupPrisma() {
  try {
    console.log('[v0] Step 1: Generating Prisma Client...');
    const { stdout: genOutput, stderr: genError } = await execAsync('npx prisma generate', {
      cwd: projectRoot,
      env: { ...process.env }
    });
    
    if (genOutput) console.log('[v0] Generate stdout:', genOutput);
    if (genError) console.log('[v0] Generate stderr:', genError);
    
    console.log('[v0] Step 2: Syncing database schema...');
    const { stdout: syncOutput, stderr: syncError } = await execAsync('npx prisma db push --skip-generate', {
      cwd: projectRoot,
      env: { ...process.env }
    });
    
    if (syncOutput) console.log('[v0] Sync stdout:', syncOutput);
    if (syncError) console.log('[v0] Sync stderr:', syncError);
    
    console.log('[v0] Prisma setup completed successfully!');
    return true;
  } catch (error) {
    console.error('[v0] Error during Prisma setup:', error.message);
    console.error('[v0] Stdout:', error.stdout);
    console.error('[v0] Stderr:', error.stderr);
    return false;
  }
}

setupPrisma().then(success => {
  if (!success) {
    console.error('[v0] Failed to setup Prisma');
    process.exit(1);
  }
});
