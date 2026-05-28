# Job Search Workflow

This file is session context for Claude. Follow these steps when the user asks to find jobs, add them to the tracker, or generate resumes.

---

## Core Directive (UPDATED 2026-05-24)

When sourcing jobs, prioritize roles that are **applicable through automation** via Playwright browser. The agent navigates directly to company career portals, fills forms, uploads the tailored resume, and submits. Gmail MCP handles OTPs when portals send verification emails.

**Companion files:**
- `APPLICATION-WORKFLOW.md` - apply phase details (default answers, Gmail MCP for OTPs)
- `APPLICATION-CONSTRAINTS.md` - MANDATORY hard rules: 30-day age limit, role relevance, Gulf countries only, no Space42, no LinkedIn, AED 30K+ minimum

**READ APPLICATION-CONSTRAINTS.md before every application cycle.** Every job must pass all constraint checks before an application is submitted.

---

## Key Paths

| Item | Path |
|------|------|
| Excel tracker | `data/applications.xlsx` → sheet: `Applications` |
| Resume output | `career-ops/output/` — named `NNN-company-role-YYYY-MM-DD.pdf/.docx/.html` |
| Resume generator | `generate-docx-resumes.ps1` |
| Export/refresh Excel | `export-applications-xlsx.ps1` |
| Pending job URLs inbox | `data/pipeline.md` |
| Credentials | `C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\.env` |
| Gmail MCP | `mcp__claude_ai_Gmail__*` — used by APPLICATION-WORKFLOW for portal OTPs |

---

## Excel Structure

File: `data/applications.xlsx`, sheet: `Applications`

Columns (read headers dynamically — never hardcode column indices):
- `#` — sequential job ID (integer)
- `Company`
- `Role`
- `Status` — see canonical values below
- `Job URL`
- `Resume Path` — path to the tailored PDF resume once generated

**Canonical Status values:**
| Status | Meaning |
|--------|---------|
| `New` | Added, not yet applied |
| `Applied` | Application submitted |
| `Manual` | Page broken / dead link — truly unreachable (NOT for forms with personal-data questions; see APPLICATION-WORKFLOW.md) |
| `Evaluated` | Evaluated, pending decision |
| `SKIP` | Not a fit, skip |
| `Discarded` | Closed or candidate rejected it |
| `Blocked` | Application gated by CAPTCHA or phone OTP |
| `Closed` | Job no longer accepting applications |
| `Interview` | In interview process |
| `Offer` | Offer received |
| `Rejected` | Rejected by company |

---

## Step 1 — Find Jobs

Primary source: **Indeed MCP** (`mcp__claude_ai_Indeed__search_jobs`). Run 8-10 searches in parallel with different query terms for maximum coverage.

Good query combinations:
- `"Senior AI Engineer" Dubai` / `"Senior AI Engineer" Abu Dhabi`
- `"Machine Learning Engineer" UAE`
- `"Applied AI Engineer" UAE`
- `"Generative AI Engineer" UAE`
- `"LLM Engineer" UAE`
- `"Agentic AI" UAE`
- `"MLOps Engineer" UAE`
- `"NLP Engineer" UAE`

Also use the ZipRecruiter MCP and Dice MCP if available.

Do NOT use LinkedIn (automation not possible).

**Sourcing scope:** After getting results, filter immediately using APPLICATION-CONSTRAINTS.md before logging anything. Skip if:
- Role is not relevant to Senior AI Engineer experience
- Posted more than 30 days ago
- Location is not a Gulf country
- Company is Space42

---

## Step 2 — Evaluate and Verify Each Job

Before applying, for each candidate:
1. Check posting date (must be within last 30 days)
2. Check role relevance (per APPLICATION-CONSTRAINTS.md)
3. Navigate to the actual job URL with Playwright (`browser_navigate` + `browser_snapshot`)
4. Confirm the page shows a live Apply button and job description
5. Identify the ATS type (Workday, Greenhouse, Lever, SAP SuccessFactors, Recruitee, native portal, etc.)

If snapshot shows only nav/footer with no job description: closed/broken, skip.

**ATS patterns encountered:**
- SAP SuccessFactors: `career5.successfactors.eu` or `successfactors.com` portals. Custom comboboxes use `{N}:_selectButton` to open, type in `{N}:_input`, wait 1-2s for list, click `li[role="option"]` by exact text.
- Recruitee: `{company}.recruitee.com` or `careers.{company}.io`. Standard form with name/email/CV upload/questions.
- Greenhouse: `boards.greenhouse.io`. Standard fields + questions.
- Lever: `jobs.lever.co`. Name/email/phone/resume + questions.
- Workday: `{company}.wd*.myworkdayjobs.com`. Stepwise form with resume parse.
- Native portals: varies by company.

When account already exists on a portal: use amarsh.pedapati@gmail.com credentials (check `.env` file for any stored portal passwords).

---

## Step 3 — Add to Excel

Use PowerShell COM to write new rows. Always:
1. Read headers dynamically
2. Find the next available row (loop until `Cells(row, idCol).Value2` is null)
3. Assign the next sequential `#` (max existing + 1)
4. Set Status to `New`
5. Save and close workbook

```powershell
$xlPath = "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops\data\applications.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open($xlPath)
$ws = $wb.Sheets.Item("Applications")

# Read headers
$headers = @{}
for ($col = 1; $col -le 20; $col++) {
    $val = $ws.Cells(1, $col).Value2
    if ($val) { $headers[$val] = $col }
}

# Find next ID and next empty row
$maxId = 0
$nextRow = 2
for ($row = 2; $row -le 300; $row++) {
    $cellVal = $ws.Cells($row, $headers["#"]).Value2
    if ($null -eq $cellVal) { $nextRow = $row; break }
    if ([int]$cellVal -gt $maxId) { $maxId = [int]$cellVal }
}
$newId = $maxId + 1

# Write new job
$ws.Cells($nextRow, $headers["#"]).Value2 = $newId
$ws.Cells($nextRow, $headers["Company"]).Value2 = "Company Name"
$ws.Cells($nextRow, $headers["Role"]).Value2 = "Role Title"
$ws.Cells($nextRow, $headers["Status"]).Value2 = "New"
$ws.Cells($nextRow, $headers["Job URL"]).Value2 = "https://..."

$wb.Save()
$wb.Close($false)
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "Added #$newId"
```

---

## Step 4 — Generate Tailored Resumes

Run the PowerShell resume generator for each new job ID:

```powershell
cd "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops"
& .\generate-docx-resumes.ps1 -Ids 108,109,110
```

This generates `.docx`, `.html`, and `.pdf` files in `output/` named:
```
NNN-company-slug-role-slug-YYYY-MM-DD.pdf
```

**Important:** Run in the current PowerShell host (not via `-File` subprocess) so Word COM conversion works reliably.

---

## Step 5 — Attach Resume Path in Excel

After generating, glob `NNN-*` in `output/` to get the actual filename, then update the `Resume Path` column:

```powershell
# Example: update Resume Path for job #108
$resumePath = "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops\output\108-company-role-2026-05-14.pdf"

# ... (open Excel with COM, find row where # = 108, set Resume Path cell)
$ws.Cells($row, $headers["Resume Path"]).Value2 = $resumePath
```

---

## Step 6 — Refresh Excel

Always run after any batch of changes:

```powershell
cd "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops"
powershell -ExecutionPolicy Bypass -File .\export-applications-xlsx.ps1
```

---

## Step 7 — Apply via Playwright

For each validated job, navigate to the portal and apply using Playwright automation:

1. `browser_navigate` to the direct application URL
2. Fill name (Amarsh Pedapati), email (amarsh.pedapati@gmail.com), phone (+91-9959822444)
3. Upload resume: use the most relevant `.docx` from `output/` (pick by role match)
   - If no tailored resume exists, use the master template: `../Amarsh_Pedapati_SeniorAIEngineer_UAE(1).docx`
4. Answer all required questions using profile data from `config/profile.yml`
5. For CAPTCHA: use CapSolver API key from `.env` file
6. Submit the form
7. Confirm success message or confirmation page

**Default answers for common form fields:**
- Current location: Hyderabad, India
- Notice period: 30-60 days / 1-2 months
- Visa/right to work: Requires UAE employment visa sponsorship
- Relocation: Yes, available to relocate to UAE
- Salary expectation: AED 30,000-40,000/month (or USD 100,000/year)
- Years of experience: 5-7 years
- LinkedIn: https://www.linkedin.com/in/amarshp/
- GitHub: https://github.com/amarshp

**Phone country code issue on forms:** The phone field often defaults to UAE (+971). Change to India (+91) by clicking the flag/country selector, then scrolling the dropdown or pressing keyboard shortcut. If dropdown won't cooperate, clear the phone field and type full number: +919959822444.

---

## Step 8 — Log to TSV Tracker

After each successful application, create a TSV file immediately:

File location: `batch/tracker-additions/{num}-{company-slug}-{role-slug}.tsv`

Format (tab-separated, single line, no trailing newline needed):
```
{num}\t{YYYY-MM-DD}\t{Company}\t{Role Title}\tApplied\t{score}/5\t❌\t\t{notes}
```

Notes should include: how applied, key skills/tech, city + country, direct URL.

Example:
```
249	2026-05-24	SIA Partners	Data & AI Senior Consultant	Applied	3.80/5	❌		Applied via SIA Partners careers portal. Data AI consulting, ML strategy. Abu Dhabi, UAE. https://sia-partners.com/en/career/
```

---

## Step 9 — Merge and Export

After completing a batch:

```powershell
cd "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops"
node merge-tracker.mjs
powershell -ExecutionPolicy Bypass -File .\export-applications-xlsx.ps1
```

---

## Notes

- **Never hardcode column indices** — always read headers from row 1.
- **Never duplicate** — check company + role before adding.
- **Assign IDs sequentially** — read max `#` from all rows, then +1.
- Jobs with `SKIP` or `Discarded` status remain in the sheet (filtered in Excel, not deleted).
- Sort order: latest unapplied jobs near the top (handled by Excel filter/sort, not script).
- **Apply phase follows APPLICATION-CONSTRAINTS.md strictly.** If a job fails any constraint check mid-application, stop and skip it.
- **Skip roles requiring experience Amarsh does not have** (deep model compression research, pure quant finance, hardware design, etc.).
- **The TSV file is the source of truth for applied entries.** Create it immediately after a successful submission before moving to the next job.
