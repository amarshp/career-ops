# Operations Guide

How to run apply sessions, switch regions, and maintain the pipeline.

---

## Starting a New Apply Session

1. Open Claude Code in the `career-ops` directory
2. State what you want clearly:
   > "Apply to 50 Singapore AI jobs" or "Continue Gulf AI batch from 103"
3. The system will load `CLAUDE.md` + `modes/_profile.md` automatically and enforce all constraints

---

## Changing Region

All geo/company/compensation targeting lives in `modes/_profile.md` under clearly labeled sections. To switch region:

### Option A: Replace the current target (one region at a time)

Edit `modes/_profile.md`:
- Update `## UAE Market Priority` header to the new region
- Update the compensation floor (SGD/USD/AED)
- Update the target company tiers
- Update `## Apply Session Constraints > Geography` to the new country list
- Update `portals.yml` with the new region's career portals

### Option B: Multi-region (recommended)

Keep existing Gulf targeting and ADD a new section:

```markdown
## Singapore Market Priority

Targeting: Singapore
Visa: Employment Pass (EP) eligible; do not reject if sponsorship not mentioned.
Reject if: "Singapore citizens/PR only", "no sponsorship", "must have existing EP".

## Singapore Target Companies

**Tier 1**: GovTech, Sea Group/Shopee, Grab AI, ByteDance SG, Google SG, Meta SG
**Tier 2**: DBS, OCBC, Visa SG, Stripe SG, Lazada, Carousell, Synapxe
**Tier 3**: Accenture SG, Thoughtworks SG, consulting volume

## Singapore Compensation

Target: SGD 10K-15K+/month
Floor: SGD 8K/month
```

Then update `portals.yml` to add Singapore company entries.

### Option C: USA Remote

```markdown
## USA Remote Market Priority

Targeting: Remote roles at US companies open to international/contractors
Visa: Not relocating; must be remote-friendly or contractor-eligible
Reject if: "US citizens only", "must be located in US", "W-2 only"

## USA Remote Compensation

Target: USD 180K-250K+ annual (contractor or full-time remote)
Floor: USD 150K annual
```

### Per-session override

If you don't want to edit files, just tell the session:
> "Apply to Singapore AI jobs. Geography: Singapore only. Floor: SGD 8K/month."

This works for a single session but won't persist. Edit `_profile.md` for persistence.

---

## Mandatory: Save JD for Every Applied Job

**RULE: Before submitting any application, save the job description to `jds/`.**

### Format

Filename: `{num}-{company-slug}-{role-slug}-{YYYY-MM-DD}.md`

Example: `356-mbzuai-data-engineer-2026-05-26.md`

### Content template

```markdown
# JD: {Company} - {Role Title} [{Location}]

Source: {URL}
Captured: {YYYY-MM-DD}

Location: {City, Country}
Relocation: {Yes/No/Not mentioned}

{One-paragraph summary of the role}

Key responsibilities:
- {bullet points from the JD}

Key requirements:
- {bullet points from the JD}

Nice to have:
- {if listed}

Compensation: {if listed, otherwise "Not disclosed"}
```

### When to capture

- **During evaluation**: JD is captured as part of report generation
- **During batch apply (no prior report)**: Capture the JD from the page snapshot BEFORE filling the form
- **If a page is simple (MBZUAI-style)**: Extract from the visible page content in the browser snapshot

This is non-negotiable. Every applied job must have its JD saved for interview prep and follow-up context.

---

## Temp File Cleanup

After each apply batch session, clean up:

### DELETE (safe to remove)
- `*.png` captcha screenshots in project root (`alpheya-captcha-state.png`, `jimmy-tech-captcha.png`, etc.)
- `batch/tracker-additions/merged/` contents (already merged)
- Any `*.tmp` files

### NEVER DELETE
- `output/*.docx` (tailored resumes)
- `output/*.pdf` (tailored resumes and cover letters)
- `output/*.html` (resume source files)
- `output/*.txt` (cover letter drafts)
- `output/amarsh-resume.pdf` (master resume)
- `jds/*.md` (job descriptions)
- `reports/*.md` (evaluation reports)
- `data/applications.md` and `data/applications.xlsx`

### Cleanup command (run at end of session)

```powershell
# Remove captcha screenshots from project root
Remove-Item -Path "*.png" -Exclude "*.screenshot.png" -ErrorAction SilentlyContinue
# Remove merged TSV files (already in applications.md)
Remove-Item -Path "batch/tracker-additions/merged/*.tsv" -ErrorAction SilentlyContinue
```

---

## Batch Index File (end of session)

After every apply batch, generate a session index at `batch/session-logs/{YYYY-MM-DD}-{region}.md`:

### Format

```markdown
# Apply Session: {Region} - {YYYY-MM-DD}

**Total applied this session:** {N}
**Cumulative total:** {M}
**Region:** {Gulf / Singapore / USA Remote / etc.}

## Applications

| # | Company | Role | Score | Portal | JD Saved |
|---|---------|------|-------|--------|----------|
| 349 | G42 | Senior Applied Scientist | 4.0/5 | Greenhouse | Yes |
| 350 | MBZUAI | Senior Data Engineer | 4.0/5 | WPForms | Yes |
...

## Portals Used
- MBZUAI careers (WPForms + reCAPTCHA v2 invisible)
- G42 Greenhouse

## Blockers Encountered
- {any new blockers discovered this session}

## Notes
- {anything notable}
```

---

## Session Start Checklist (for the LLM)

When starting an apply session, the LLM must:

1. Read `modes/_profile.md` to load all constraints
2. Read `data/applications.md` to know current state and enable dedup
3. Confirm the target region and goal with the user
4. **Load country resume norms** (CRITICAL — before generating any resume):
   - Check if `config/resume-norms/{region}.md` exists (uae / sgp / usa / etc.)
   - If yes: load it silently, confirm: "UAE resume norms loaded (photo omitted, relocation statement, A4)."
   - If no: run `modes/country-resume.md` to research and create the norms file first. Do not generate resumes until it exists.
5. For each job:
   a. Check dedup (Step 0 from `modes/apply.md`)
   b. Claim report num: `node scripts/claim-num.mjs`
   c. Save JD to `jds/`
   d. Generate resume: apply country norms (Layer 2) + per-job tailoring (Layer 3) on top of `cv.md` (Layer 1)
   e. Fill form and submit
   f. Write TSV to `batch/tracker-additions/`
6. At end of session:
   a. Run `node merge-tracker.mjs`
   b. Run `powershell -ExecutionPolicy Bypass -File .\export-applications-xlsx.ps1`
   c. Generate session index file
   d. Run temp cleanup

---

## Parallel Sessions (Multiple Regions Simultaneously)

You can open multiple Claude Code windows and run each on a different region at the same time. Three things need to be handled safely:

### 1. Browser Profiles (CRITICAL)

Each CC window launches its own Playwright MCP server — browsers are isolated. But any headful helper script (e.g. `apply-today-*.mjs`) must use a **region-specific profile directory** to avoid Chromium's SingletonLock:

```javascript
// Use launchPersistentContext with the region profile dir
const context = await chromium.launchPersistentContext(
  'profiles/sgp',   // or profiles/uae, profiles/usa
  { headless: false, args: ['--start-maximized'], viewport: null }
);
const page = await context.newPage();
```

Profiles live in `profiles/{region}/`. Each session logs in once to its own browser instance.

### 2. Report Numbers (CRITICAL)

**Never compute `max(reports/) + 1` manually when parallel sessions are running.** Two sessions reading at the same moment both see the same max and both claim the same number.

Use the atomic number claimer instead:

```bash
# In PowerShell:
$NUM = node scripts/claim-num.mjs
# $NUM is now "050" (3-digit padded)

# In Bash:
NUM=$(node scripts/claim-num.mjs)
```

Or in a Node.js `.mjs` script:

```javascript
import { execSync } from 'child_process';
const num = execSync('node scripts/claim-num.mjs', { encoding: 'utf8' }).trim();
// num = "050"
```

`claim-num.mjs` uses an exclusive file lock (`data/num.lock`) so concurrent calls queue safely. If the lock is stale after a crash, delete `data/num.lock` manually.

### 3. applications.md Writes (CRITICAL)

In parallel mode, **no session writes directly to `data/applications.md`** — not even status updates.

- **New entries**: write TSV to `batch/tracker-additions/{num}-{slug}.tsv` as normal.
- **Status updates** (e.g. Evaluated → Applied): write a patch TSV to `batch/tracker-additions/{num}-{slug}-update.tsv` with the same format. When merge runs serially, it will apply the update.

Run `node merge-tracker.mjs` in ONE session (or after all sessions finish) — not concurrently.

### Summary: What's safe to do in parallel

| Action | Safe? | Notes |
|--------|-------|-------|
| Navigate/apply via browser_* MCP tools | Yes | Each CC window has its own browser |
| Read reports/, data/, modes/ | Yes | Read-only, no conflict |
| Write batch/tracker-additions/*.tsv | Yes | Each file is unique per report num |
| Write jds/*.md, reports/*.md | Yes | Each file is unique per report num |
| Get next report num | Only via `claim-num.mjs` | Never compute manually in parallel |
| Write to data/applications.md | No | Use TSV only; merge serially after |
| Run merge-tracker.mjs | No (concurrent) | Run in one session or after sessions finish |
| Run scan.mjs on same portal | No | Rate-limit risk; split portals by region |

### Starting a Parallel Session

Tell each CC window which region it owns:

```
Session 1: "Apply to UAE. Target: 30 jobs. AED 30K+ floor."
Session 2: "Apply to Singapore. Target: 20 jobs. SGD 8K+ floor."
Session 3: "Apply to USA Remote. Target: 15 jobs. USD 150K+ floor."
```

The session reads this guide, uses claim-num.mjs for numbers, writes TSVs only, and merges at the end.

---

## Quick Reference: Session Prompts

**Continue Gulf batch:**
> "Continue Gulf AI apply batch. Currently at 103 applied. Target: 150."

**Start Singapore batch:**
> "Start Singapore AI apply batch. Target: 50 roles. SGD 8K+ floor."

**Start USA Remote batch:**
> "Start USA Remote AI apply batch. Target: 30 roles. USD 150K+ floor."

**One-off apply:**
> "Apply to this role: {paste URL}"
