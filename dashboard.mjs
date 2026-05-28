#!/usr/bin/env node
/**
 * Career-Ops Dashboard
 *
 * Usage:
 *   node dashboard.mjs              → terminal snapshot
 *   node dashboard.mjs --html       → generate output/dashboard.html + open in browser
 *   node dashboard.mjs --watch      → terminal refresh every 30s
 *   node dashboard.mjs --html --watch → regenerate HTML every 30s (refresh browser manually)
 *   npm run dashboard
 *   npm run dashboard:html
 *   npm run dashboard:watch
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRACKER   = resolve(__dirname, 'data', 'applications.md');
const HTML_OUT  = resolve(__dirname, 'output', 'dashboard.html');
const WATCH_MS  = 30_000;

const HTML_MODE  = process.argv.includes('--html');
const WATCH_MODE = process.argv.includes('--watch');

// ── Region config ────────────────────────────────────────────────────────────

const REGION_ORDER = ['UAE','SGP','UK','DE','NL','AUS','CA','GULF_PLUS','REMOTE','GULF','UNTAGGED'];
const REGION_LABEL = {
  UAE:'UAE', SGP:'Singapore', UK:'UK', DE:'Germany', NL:'Netherlands',
  AUS:'Australia', CA:'Canada', GULF_PLUS:'Gulf+', REMOTE:'Remote',
  GULF:'Gulf (old)', UNTAGGED:'Untagged',
};
const REGION_COLOR = {
  UAE:'#F59E0B', SGP:'#EF4444', UK:'#3B82F6', DE:'#84CC16',
  NL:'#F97316', AUS:'#14B8A6', CA:'#8B5CF6', GULF_PLUS:'#EC4899',
  REMOTE:'#06B6D4', GULF:'#A78BFA', UNTAGGED:'#6B7280',
};

const SKIP_STATUS   = new Set(['SKIP','Discarded','Rejected']);
const ACTIVE_STATUS = ['Applied','Responded','Interview','Offer'];

// ── Parser ───────────────────────────────────────────────────────────────────

function parse(content) {
  const rows = [];
  let inTable = false;
  for (const line of content.split('\n')) {
    if (/^\| #/.test(line))        { inTable = true; continue; }
    if (/^\|[-\s|]+$/.test(line))  { continue; }
    if (!inTable || !line.startsWith('|')) continue;
    const c = line.split('|').map(s => s.trim()).filter(Boolean);
    if (c.length < 6) continue;
    rows.push({ num: c[0], date: c[1], company: c[2], role: c[3],
                score: c[4], status: c[5], notes: c[8] ?? '' });
  }
  return rows;
}

function regionOf(notes) {
  const m = notes.match(/\[([A-Z_+]+)\]/);
  return m ? m[1] : 'UNTAGGED';
}

// ── Aggregate ────────────────────────────────────────────────────────────────

function aggregate(rows) {
  const byRegion   = {};   // region → { Applied, Responded, Interview, Offer, total }
  const byDay      = {};   // date   → region → count

  for (const row of rows) {
    if (SKIP_STATUS.has(row.status)) continue;
    const r = regionOf(row.notes);
    if (!byRegion[r]) byRegion[r] = { Applied:0, Responded:0, Interview:0, Offer:0, total:0 };
    byRegion[r].total++;
    if (byRegion[r][row.status] !== undefined) byRegion[r][row.status]++;

    // only count actually submitted statuses in daily chart
    if (!ACTIVE_STATUS.includes(row.status)) continue;
    const d = row.date || 'Unknown';
    if (!byDay[d]) byDay[d] = {};
    byDay[d][r] = (byDay[d][r] ?? 0) + 1;
  }

  return { byRegion, byDay };
}

// ── Terminal render ──────────────────────────────────────────────────────────

function renderTerminal(byRegion) {
  const W = 70;
  const now = new Date().toLocaleString('en-IN', {
    timeZone:'Asia/Kolkata', year:'numeric', month:'short',
    day:'2-digit', hour:'2-digit', minute:'2-digit' });

  const col  = (s,w) => String(s).padEnd(w);
  const rcol = (s,w) => String(s).padStart(w);

  if (WATCH_MODE) process.stdout.write('\x1Bc');
  console.log('\n' + '═'.repeat(W));
  console.log('  Career-Ops  —  Application Dashboard         ' + now);
  console.log('═'.repeat(W));
  console.log(col('Region',16)+rcol('Applied',9)+rcol('Responded',11)+rcol('Interview',11)+rcol('Offer',7)+rcol('Total',8));
  console.log('─'.repeat(W));

  let tA=0, tR=0, tI=0, tO=0, tT=0;
  const regions = [...REGION_ORDER.filter(r=>byRegion[r]),
                   ...Object.keys(byRegion).filter(r=>!REGION_ORDER.includes(r))];

  for (const r of regions) {
    const c = byRegion[r];
    console.log(col(REGION_LABEL[r]??r,16)+rcol(c.Applied,9)+rcol(c.Responded,11)+rcol(c.Interview,11)+rcol(c.Offer,7)+rcol(c.total,8));
    tA+=c.Applied; tR+=c.Responded; tI+=c.Interview; tO+=c.Offer; tT+=c.total;
  }

  console.log('─'.repeat(W));
  console.log(col('TOTAL',16)+rcol(tA,9)+rcol(tR,11)+rcol(tI,11)+rcol(tO,7)+rcol(tT,8));
  console.log('═'.repeat(W));

  const respRate = tA>0 ? (((tR+tI+tO)/tA)*100).toFixed(1) : '—';
  const intRate  = tA>0 ? (((tI+tO)/tA)*100).toFixed(1) : '—';
  console.log(`  Response rate: ${respRate}%    Interview rate: ${intRate}%    Offers: ${tO}`);
  if (WATCH_MODE) console.log(`  Auto-refreshing every ${WATCH_MS/1000}s  (Ctrl+C to stop)`);
  console.log('═'.repeat(W) + '\n');
}

// ── HTML render ──────────────────────────────────────────────────────────────

function renderHTML(byRegion, byDay) {
  // Sort dates ascending, keep last 60 days
  const allDates = Object.keys(byDay)
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .slice(-60);

  const regions = [...REGION_ORDER.filter(r => byRegion[r] || allDates.some(d => byDay[d]?.[r])),
                   ...Object.keys(byRegion).filter(r => !REGION_ORDER.includes(r))];

  // Build chart datasets (one per region)
  const datasets = regions.map(r => ({
    label: REGION_LABEL[r] ?? r,
    backgroundColor: REGION_COLOR[r] ?? '#9CA3AF',
    data: allDates.map(d => byDay[d]?.[r] ?? 0),
  }));

  // Totals for summary
  let tA=0,tR=0,tI=0,tO=0,tT=0;
  for (const c of Object.values(byRegion)) { tA+=c.Applied; tR+=c.Responded; tI+=c.Interview; tO+=c.Offer; tT+=c.total; }

  const respRate = tA>0 ? (((tR+tI+tO)/tA)*100).toFixed(1) : '—';
  const intRate  = tA>0 ? (((tI+tO)/tA)*100).toFixed(1) : '—';

  // Summary table rows
  const summaryRows = regions.map(r => {
    const c = byRegion[r] ?? { Applied:0, Responded:0, Interview:0, Offer:0, total:0 };
    const dot = `<span class="dot" style="background:${REGION_COLOR[r]??'#9CA3AF'}"></span>`;
    return `<tr><td>${dot}${REGION_LABEL[r]??r}</td><td>${c.Applied}</td><td>${c.Responded}</td><td>${c.Interview}</td><td>${c.Offer}</td><td><strong>${c.total}</strong></td></tr>`;
  }).join('\n');

  // Daily table (last 30 days, most recent first)
  const dailyDates = [...allDates].reverse().slice(0,30);
  const dailyCols = regions.filter(r => dailyDates.some(d => byDay[d]?.[r]));
  const dailyHeader = dailyCols.map(r => `<th>${REGION_LABEL[r]??r}</th>`).join('');
  const dailyRows = dailyDates.map(d => {
    const cells = dailyCols.map(r => `<td>${byDay[d]?.[r] ?? ''}</td>`).join('');
    const total = dailyCols.reduce((s,r) => s+(byDay[d]?.[r]??0), 0);
    return `<tr><td class="date-col">${d}</td>${cells}<td><strong>${total||''}</strong></td></tr>`;
  }).join('\n');

  const now = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',
    year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'});

  const targets = { UAE:100, SGP:100, UK:100, DE:100, NL:100, AUS:100, CA:100, GULF_PLUS:100, REMOTE:100 };
  const progressBars = regions.filter(r=>targets[r]).map(r => {
    const pct = Math.min(100, Math.round(((byRegion[r]?.Applied??0) / targets[r]) * 100));
    const applied = byRegion[r]?.Applied ?? 0;
    return `
      <div class="progress-row">
        <span class="pr-label"><span class="dot" style="background:${REGION_COLOR[r]}"></span>${REGION_LABEL[r]??r}</span>
        <div class="pr-bar-wrap"><div class="pr-bar" style="width:${pct}%;background:${REGION_COLOR[r]}"></div></div>
        <span class="pr-count">${applied} / ${targets[r]}</span>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Career-Ops Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
<style>
  :root{--bg:#0f172a;--card:#1e293b;--border:#334155;--text:#f1f5f9;--muted:#94a3b8;--accent:#38bdf8}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);padding:24px;min-height:100vh}
  h1{font-size:1.4rem;font-weight:700;margin-bottom:4px}
  .subtitle{color:var(--muted);font-size:.85rem;margin-bottom:24px}
  .stats{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap}
  .stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 24px;min-width:130px}
  .stat-val{font-size:2rem;font-weight:800;line-height:1}
  .stat-label{color:var(--muted);font-size:.75rem;margin-top:4px;text-transform:uppercase;letter-spacing:.05em}
  .card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:24px}
  .card h2{font-size:1rem;font-weight:600;margin-bottom:16px;color:var(--accent)}
  .chart-wrap{position:relative;height:320px}
  table{width:100%;border-collapse:collapse;font-size:.85rem}
  th{color:var(--muted);text-align:right;padding:8px 12px;border-bottom:1px solid var(--border);font-weight:500;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}
  th:first-child{text-align:left}
  td{padding:8px 12px;border-bottom:1px solid var(--border);text-align:right}
  td:first-child{text-align:left}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:rgba(255,255,255,.03)}
  .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:middle}
  .date-col{color:var(--muted);font-variant-numeric:tabular-nums}
  .progress-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
  .pr-label{width:110px;font-size:.83rem;display:flex;align-items:center;flex-shrink:0}
  .pr-bar-wrap{flex:1;height:12px;background:#1e3a5f;border-radius:6px;overflow:hidden}
  .pr-bar{height:100%;border-radius:6px;transition:width .3s}
  .pr-count{width:70px;text-align:right;font-size:.82rem;color:var(--muted);font-variant-numeric:tabular-nums}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  @media(max-width:768px){.grid2{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>Career-Ops — Application Dashboard</h1>
<p class="subtitle">Last updated: ${now} IST &nbsp;·&nbsp; Refresh page after running <code>npm run dashboard:html</code></p>

<div class="stats">
  <div class="stat"><div class="stat-val">${tA}</div><div class="stat-label">Applied</div></div>
  <div class="stat"><div class="stat-val">${tR+tI+tO}</div><div class="stat-label">Responded</div></div>
  <div class="stat"><div class="stat-val">${tI+tO}</div><div class="stat-label">Interviews</div></div>
  <div class="stat"><div class="stat-val">${tO}</div><div class="stat-label">Offers</div></div>
  <div class="stat"><div class="stat-val">${respRate}%</div><div class="stat-label">Response rate</div></div>
  <div class="stat"><div class="stat-val">${intRate}%</div><div class="stat-label">Interview rate</div></div>
</div>

<div class="card">
  <h2>Applications per Day by Country</h2>
  <div class="chart-wrap"><canvas id="dailyChart"></canvas></div>
</div>

<div class="grid2">
  <div class="card">
    <h2>Progress to 100 per Region</h2>
    ${progressBars || '<p style="color:var(--muted);font-size:.85rem">No data yet</p>'}
  </div>
  <div class="card">
    <h2>All-Time by Region</h2>
    <table>
      <thead><tr><th>Region</th><th>Applied</th><th>Responded</th><th>Interview</th><th>Offer</th><th>Total</th></tr></thead>
      <tbody>
        ${summaryRows}
        <tr style="border-top:2px solid var(--border)"><td><strong>Total</strong></td><td><strong>${tA}</strong></td><td><strong>${tR}</strong></td><td><strong>${tI}</strong></td><td><strong>${tO}</strong></td><td><strong>${tT}</strong></td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="card">
  <h2>Daily Breakdown (last 30 days, most recent first)</h2>
  <div style="overflow-x:auto">
  <table>
    <thead><tr><th>Date</th>${dailyHeader}<th>Total</th></tr></thead>
    <tbody>${dailyRows || '<tr><td colspan="20" style="color:var(--muted);text-align:center;padding:24px">No dated entries yet</td></tr>'}</tbody>
  </table>
  </div>
</div>

<script>
const labels = ${JSON.stringify(allDates)};
const datasets = ${JSON.stringify(datasets)};
new Chart(document.getElementById('dailyChart'), {
  type: 'bar',
  data: { labels, datasets },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position:'right', labels:{ color:'#94a3b8', boxWidth:12, padding:16 } }, tooltip:{ mode:'index', intersect:false } },
    scales: {
      x: { stacked:true, ticks:{ color:'#94a3b8', maxTicksLimit:20, maxRotation:45 }, grid:{ color:'#1e293b' } },
      y: { stacked:true, ticks:{ color:'#94a3b8', precision:0 }, grid:{ color:'#334155' }, title:{ display:true, text:'Applications', color:'#94a3b8' } }
    }
  }
});
</script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function run() {
  let content;
  try { content = readFileSync(TRACKER, 'utf8'); }
  catch { console.error('Cannot read data/applications.md'); return; }

  const rows = parse(content);
  const { byRegion, byDay } = aggregate(rows);

  if (HTML_MODE) {
    try { mkdirSync(resolve(__dirname, 'output'), { recursive: true }); } catch {}
    const html = renderHTML(byRegion, byDay);
    writeFileSync(HTML_OUT, html, 'utf8');
    console.log(`Dashboard written to: ${HTML_OUT}`);
    if (!WATCH_MODE) {
      try {
        const cmd = process.platform === 'win32' ? `start "" "${HTML_OUT}"` : `open "${HTML_OUT}"`;
        execSync(cmd);
      } catch {}
    }
  } else {
    renderTerminal(byRegion);
  }
}

run();
if (WATCH_MODE) setInterval(run, WATCH_MS);
