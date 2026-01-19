/**
 * Cross-platform development cache cleaner
 * Automatically clears .next cache before dev server starts
 */

import { rm, access } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const CACHE_DIRS = ['.next'];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function cleanCache() {
  console.log('\x1b[36m⚡ Cleaning development cache...\x1b[0m');

  for (const dir of CACHE_DIRS) {
    const fullPath = join(ROOT, dir);
    if (await exists(fullPath)) {
      try {
        await rm(fullPath, { recursive: true, force: true });
        console.log(`   \x1b[32m✓\x1b[0m Removed ${dir}`);
      } catch (err) {
        console.log(`   \x1b[33m⚠\x1b[0m Could not remove ${dir}: ${err.message}`);
      }
    }
  }

  console.log('\x1b[36m⚡ Cache cleared. Starting dev server...\x1b[0m\n');
}

cleanCache();
