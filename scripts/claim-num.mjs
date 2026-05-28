#!/usr/bin/env node
/**
 * Atomically claims the next available report number.
 *
 * Uses an exclusive-create lock file so concurrent sessions don't claim the same number.
 * Persists a counter in data/num-counter.txt so claims are tracked even before files are written.
 *
 * Usage:
 *   node scripts/claim-num.mjs
 *   → prints the claimed number to stdout, e.g. "050"
 *
 * Shell capture:
 *   $NUM = node scripts/claim-num.mjs          # PowerShell
 *   NUM=$(node scripts/claim-num.mjs)           # Bash
 *
 * If data/num.lock is stale after a crash, delete it manually and re-run.
 */

import { openSync, closeSync, unlinkSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const LOCK_FILE = join(ROOT, 'data', 'num.lock');
const COUNTER_FILE = join(ROOT, 'data', 'num-counter.txt');
const REPORTS_DIR = join(ROOT, 'reports');
const TRACKER_ADDITIONS_DIR = join(ROOT, 'batch', 'tracker-additions');

async function acquireLock(maxRetries = 50, delayMs = 200) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const fd = openSync(LOCK_FILE, 'wx');
      closeSync(fd);
      return;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error(
    'Could not acquire data/num.lock after 50 retries (10 seconds).\n' +
    'If no other session is running, the lock is stale — delete data/num.lock and retry.'
  );
}

function releaseLock() {
  try { unlinkSync(LOCK_FILE); } catch {}
}

function maxFromDir(dir, pattern) {
  try {
    return readdirSync(dir).reduce((max, f) => {
      const m = f.match(pattern);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
  } catch {
    return 0;
  }
}

function readCounter() {
  try {
    const val = parseInt(readFileSync(COUNTER_FILE, 'utf8').trim(), 10);
    return isNaN(val) ? 0 : val;
  } catch {
    return 0;
  }
}

function writeCounter(num) {
  writeFileSync(COUNTER_FILE, String(num), 'utf8');
}

async function main() {
  await acquireLock();
  try {
    const fromReports = maxFromDir(REPORTS_DIR, /^(\d+)-/);
    const fromAdditions = maxFromDir(TRACKER_ADDITIONS_DIR, /^(\d+)-/);
    const fromCounter = readCounter();
    const next = Math.max(fromReports, fromAdditions, fromCounter) + 1;
    writeCounter(next);
    const padded = String(next).padStart(3, '0');
    process.stdout.write(padded + '\n');
  } finally {
    releaseLock();
  }
}

main().catch(e => {
  releaseLock();
  console.error('claim-num error:', e.message);
  process.exit(1);
});
