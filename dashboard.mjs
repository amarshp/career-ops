#!/usr/bin/env node
/**
 * Live application dashboard.
 * Reads data/applications.md, counts by region tag, prints a status table.
 *
 * Usage:  node dashboard.mjs
 *         npm run dashboard
 *         node dashboard.mjs --watch   (refresh every 30s)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRACKER = resolve(__dirname, 'data', 'applications.md');
const WATCH_INTERVAL_MS = 30_000;
const WATCH = process.argv.includes('--watch');

const REGION_ORDER = ['UAE', 'SGP', 'UK', 'DE', 'NL', 'AUS', 'CA', 'GULF_PLUS', 'REMOTE', 'GULF'];
const REGION_LABELS = {
  UAE: 'UAE', SGP: 'Singapore', UK: 'UK', DE: 'Germany',
  NL: 'Netherlands', AUS: 'Australia', CA: 'Canada',
  GULF_PLUS: 'Gulf+', REMOTE: 'Remote', GULF: 'Gulf (old)',
};

const ACTIVE = ['Applied', 'Responded', 'Interview', 'Offer'];
const SKIP   = ['SKIP', 'Discarded', 'Rejected'];

function parseTracker(content) {
  const rows = [];
  let inTable = false;
  for (const line of content.split('\n')) {
    if (/^\| #/.test(line))        { inTable = true; continue; }
    if (/^\|[-\s|]+$/.test(line))  { continue; }
    if (!inTable || !line.startsWith('|')) continue;
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 6) continue;
    rows.push({
      num:    cols[0],
      date:   cols[1],
      company:cols[2],
      role:   cols[3],
      score:  cols[4],
      status: cols[5],
      notes:  cols[8] ?? '',
    });
  }
  return rows;
}

function regionOf(notes) {
  const m = notes.match(/\[([A-Z_+]+)\]/);
  return m ? m[1] : 'UNTAGGED';
}

function blank() {
  return { Applied: 0, Responded: 0, Interview: 0, Offer: 0, Rejected: 0, total: 0 };
}

function render() {
  let content;
  try { content = readFileSync(TRACKER, 'utf8'); }
  catch { console.error('Cannot read data/applications.md'); return; }

  const apps = parseTracker(content);
  const counts = {};

  for (const app of apps) {
    if (SKIP.includes(app.status)) continue;
    const r = regionOf(app.notes);
    if (!counts[r]) counts[r] = blank();
    counts[r].total++;
    if (counts[r][app.status] !== undefined) counts[r][app.status]++;
  }

  const regions = [
    ...REGION_ORDER.filter(r => counts[r]),
    ...Object.keys(counts).filter(r => !REGION_ORDER.includes(r)),
  ];

  // totals
  const tot = blank();
  for (const c of Object.values(counts)) {
    tot.Applied   += c.Applied;
    tot.Responded += c.Responded;
    tot.Interview += c.Interview;
    tot.Offer     += c.Offer;
    tot.total     += c.total;
  }

  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata',
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit' });

  const W = 70;
  const line  = '─'.repeat(W);
  const dline = '═'.repeat(W);

  const col = (s, w) => String(s).padEnd(w);
  const rcol = (s, w) => String(s).padStart(w);

  if (WATCH) process.stdout.write('\x1Bc'); // clear screen on watch mode

  console.log('\n' + dline);
  console.log('  Career-Ops  —  Application Dashboard         ' + now);
  console.log(dline);
  console.log(
    col('Region', 16) +
    rcol('Applied', 9) +
    rcol('Responded', 11) +
    rcol('Interview', 11) +
    rcol('Offer', 7) +
    rcol('Total', 8)
  );
  console.log(line);

  for (const r of regions) {
    const c = counts[r];
    const label = REGION_LABELS[r] ?? r;
    console.log(
      col(label, 16) +
      rcol(c.Applied,   9) +
      rcol(c.Responded, 11) +
      rcol(c.Interview, 11) +
      rcol(c.Offer,     7) +
      rcol(c.total,     8)
    );
  }

  console.log(line);
  console.log(
    col('TOTAL', 16) +
    rcol(tot.Applied,   9) +
    rcol(tot.Responded, 11) +
    rcol(tot.Interview, 11) +
    rcol(tot.Offer,     7) +
    rcol(tot.total,     8)
  );
  console.log(dline);

  const respRate  = tot.Applied > 0
    ? (((tot.Responded + tot.Interview + tot.Offer) / tot.Applied) * 100).toFixed(1)
    : '—';
  const intRate   = tot.Applied > 0
    ? (((tot.Interview + tot.Offer) / tot.Applied) * 100).toFixed(1)
    : '—';

  console.log(`  Response rate: ${respRate}%    Interview rate: ${intRate}%    Offers: ${tot.Offer}`);
  if (WATCH) console.log(`  Auto-refreshing every ${WATCH_INTERVAL_MS / 1000}s  (Ctrl+C to stop)`);
  console.log(dline + '\n');
}

render();
if (WATCH) setInterval(render, WATCH_INTERVAL_MS);
