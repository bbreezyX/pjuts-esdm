/**
 * Cross-platform development cache cleaner
 * Clears .next cache and optionally cleans additional caches
 * 
 * Usage:
 *   node scripts/clean-dev.mjs          # Basic clean (.next only)
 *   node scripts/clean-dev.mjs --full   # Full clean (includes node_modules/.cache, tsconfig.tsbuildinfo)
 */

import { rm, access, readdir, unlink } from 'fs/promises';
import { join, extname } from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const isFullClean = args.includes('--full');

// Directories to always clean
const CACHE_DIRS = ['.next'];

// Additional directories/files for full clean
const FULL_CLEAN_DIRS = [
  'node_modules/.cache',
  '.turbo',
];

const FULL_CLEAN_FILES = [
  'tsconfig.tsbuildinfo',
  '.eslintcache',
];

// Service worker files that can cause caching issues
const SW_PATTERNS = ['sw.js', 'workbox-', 'swe-worker-'];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function cleanDirectory(dir, label) {
  const fullPath = join(ROOT, dir);
  if (await exists(fullPath)) {
    try {
      await rm(fullPath, { recursive: true, force: true });
      console.log(`   \x1b[32m✓\x1b[0m Removed ${label || dir}`);
      return true;
    } catch (err) {
      console.log(`   \x1b[33m⚠\x1b[0m Could not remove ${dir}: ${err.message}`);
    }
  }
  return false;
}

async function cleanFile(file, label) {
  const fullPath = join(ROOT, file);
  if (await exists(fullPath)) {
    try {
      await unlink(fullPath);
      console.log(`   \x1b[32m✓\x1b[0m Removed ${label || file}`);
      return true;
    } catch (err) {
      console.log(`   \x1b[33m⚠\x1b[0m Could not remove ${file}: ${err.message}`);
    }
  }
  return false;
}

async function cleanServiceWorkers() {
  const publicDir = join(ROOT, 'public');
  if (!(await exists(publicDir))) return;

  try {
    const files = await readdir(publicDir);
    let cleaned = 0;

    for (const file of files) {
      const isServiceWorker = SW_PATTERNS.some(pattern => file.startsWith(pattern));
      const isJsMap = file.endsWith('.js.map') && SW_PATTERNS.some(pattern => file.startsWith(pattern));
      
      if (isServiceWorker || isJsMap) {
        const fullPath = join(publicDir, file);
        try {
          await unlink(fullPath);
          cleaned++;
        } catch {
          // Ignore individual file errors
        }
      }
    }

    if (cleaned > 0) {
      console.log(`   \x1b[32m✓\x1b[0m Removed ${cleaned} service worker file(s) from public/`);
    }
  } catch {
    // Ignore directory read errors
  }
}

async function cleanCache() {
  console.log(`\x1b[36m⚡ Cleaning development cache${isFullClean ? ' (full)' : ''}...\x1b[0m`);

  // Always clean these
  for (const dir of CACHE_DIRS) {
    await cleanDirectory(dir);
  }

  // Clean service workers that may cause caching issues
  await cleanServiceWorkers();

  // Full clean - additional caches
  if (isFullClean) {
    console.log('\x1b[36m   Additional cleanup:\x1b[0m');
    
    for (const dir of FULL_CLEAN_DIRS) {
      await cleanDirectory(dir);
    }
    
    for (const file of FULL_CLEAN_FILES) {
      await cleanFile(file);
    }
  }

  console.log('\x1b[36m⚡ Cache cleared. Starting dev server...\x1b[0m\n');
  
  // Print helpful tips
  if (!isFullClean) {
    console.log('\x1b[90mTip: Use "npm run dev:clean" for a more thorough clean\x1b[0m');
    console.log('\x1b[90mTip: If changes still don\'t appear, try clearing browser cache (Ctrl+Shift+R)\x1b[0m\n');
  }
}

cleanCache();
