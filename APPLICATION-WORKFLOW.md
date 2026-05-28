# Application Workflow

This file is session context for Claude. Follow these steps when the user asks to apply to jobs in the Excel tracker.

---

## Core Directive (UPDATED 2026-05-16)

**Apply to as many jobs as possible.** Only mark `Manual` or `Blocked` when **truly stuck** — i.e., CAPTCHA, OTP required, page won't load after retries, or the form is genuinely impossible to complete without user-only data the agent has no answer for.

**Do NOT mark Manual just because** the form asks for salary, visa status, nationality, notice period, or other personal data. Use the **Default Answers** table below to answer them.

**If a login code / OTP is sent to email** (e.g. company portal sign-in), use the Gmail MCP tools to retrieve it. See "Email-based Login Codes" section.

---

## Key Paths

| Item | Path |
|------|------|
| Excel tracker | `data/applications.xlsx` → sheet: `Applications` |
| Resume output dir | `career-ops/output/` |
| LinkedIn credentials | `C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\.env` |
| Export script | `export-applications-xlsx.ps1` |

**Credentials** (from `.env`):
- Email: `amarsh.pedapati@gmail.com`
- Password: `Nigga@123`

---

## Default Answers — Use These Instead of Marking Manual

When forms ask for personal data, answer with these defaults (do NOT mark Manual):

| Question | Default Answer |
|----------|---------------|
| Current location | `Dubai, United Arab Emirates` |
| Nationality | `Indian` |
| Visa status / Work authorization in UAE | `Will require visa sponsorship` (unless user has UAE residency — confirm once per session) |
| Current salary (AED, monthly) | `25,000 AED` |
| Expected salary (AED, monthly) | `30,000 - 35,000 AED` |
| Current salary (USD/yearly) | `$80,000` |
| Expected salary (USD/yearly) | `$110,000 - $130,000` |
| Notice period | `30 days` (1 month) |
| Years of experience (Python) | `5` |
| Years of experience (ML/AI generally) | `4` |
| Years of experience (Data Science) | `4` |
| Years of experience (specific tools like Kubernetes/MLOps/Tableau/SSIS) | `2-3` (pick conservatively if unknown) |
| Bachelor's degree completed | `Yes` (IIT Hyderabad) |
| Master's degree | `Yes` (IIT Hyderabad, AI '23) |
| Authorized to work in UAE | `No, would need sponsorship` |
| Willingness to relocate to UAE | `Yes` |
| English proficiency | `Fluent / Native-equivalent` |
| Marital status | `Single` |
| Gender (if optional) | leave blank or `Prefer not to say` |
| Family book number / Emirates ID / Passport # | leave blank; ONLY skip step if mandatory and form rejects empty value |
| Cover letter (optional) | Skip / leave blank |
| Cover letter (required) | Generate a 4-6 sentence tailored intro based on the JD |

**Family book / passport number**: If genuinely required and mandatory → mark `Blocked` (not Manual). Otherwise skip / leave empty.

---

## Email-based Login Codes (Gmail MCP)

If a job portal sends a verification code or magic link to the user's Gmail:

1. After triggering the email send, wait ~10 seconds.
2. Use Gmail MCP to search recent inbox:
   - `mcp__claude_ai_Gmail__search_threads` with query like `from:noreply newer_than:5m` or company name
3. Use `mcp__claude_ai_Gmail__get_thread` to read the code/link.
4. Enter the code into the portal field, or `browser_navigate` to the magic link.
5. Continue the application.

**Do NOT mark Manual just because OTP was sent to email** — retrieve it via Gmail MCP and continue.

---

## Scope — Which Jobs to Apply To

Target all rows in `Applications` sheet where `Status = "New"`. Read from Excel using PowerShell COM at session start.

```powershell
$xlPath = "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops\data\applications.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open($xlPath)
$ws = $wb.Sheets.Item("Applications")
$headers = @{}
for ($col = 1; $col -le 20; $col++) {
    $val = $ws.Cells(1, $col).Value2
    if ($val) { $headers[$val] = $col }
}
$newJobs = @()
for ($row = 2; $row -le 300; $row++) {
    $id = $ws.Cells($row, $headers["#"]).Value2
    if ($null -eq $id) { break }
    $status = $ws.Cells($row, $headers["Status"]).Value2
    if ($status -eq "New") {
        $newJobs += [PSCustomObject]@{
            Id = [int]$id
            Company = $ws.Cells($row, $headers["Company"]).Value2
            Role = $ws.Cells($row, $headers["Role"]).Value2
            URL = $ws.Cells($row, $headers["Job URL"]).Value2
        }
    }
}
$wb.Close($false)
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
$newJobs | Format-Table
```

---

## Pre-Flight: Find the Resume

```powershell
Get-ChildItem "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops\output" -Filter "NNN-*" | Where-Object { $_.Extension -eq ".pdf" }
```

Replace `NNN` with the job ID.

---

## Per-Job Application Process

### 1. Navigate and Detect Apply Type

```
browser_navigate → job URL
browser_snapshot (save to file, e.g., snapNNN.txt)
```

If first inline snapshot shows only nav/footer → save to file and grep instead. LinkedIn renders async.

**Apply type detection (efficient method):**
```js
browser_evaluate → () => {
  const els = Array.from(document.querySelectorAll('a, button'));
  const easyApply = els.find(el => /Easy Apply/i.test(el.textContent || ''));
  const companySite = els.find(el => /company website/i.test(el.textContent || ''));
  const closed = els.find(el => /No longer/i.test(el.textContent || ''));
  if (easyApply) { easyApply.click(); return 'easy_apply_clicked'; }
  if (companySite) return 'manual_external';
  if (closed) return 'closed';
  return 'unknown';
}
```

Decision:
- `easy_apply_clicked` → continue with LinkedIn Easy Apply
- `manual_external` → click "Apply on company website", attempt the external portal (most are reachable). Only mark Manual if external portal has CAPTCHA, dead link, or requires login the agent can't bypass.
- `closed` → mark `Closed`
- `unknown` → snapshot again to file, grep for apply type

### 2. LinkedIn Easy Apply — Form Steps

Click Easy Apply, then progress through steps using **Next / Continue to next step** buttons.

#### Contact Info step
- Pre-filled. Verify, click Continue.

#### Resume Upload step
- **Always upload the tailored resume for this job ID** (LinkedIn remembers the last-used resume — don't trust it).
- Click "Upload resume" → `browser_file_upload` with the PDF path for NNN.
- After upload, click **Review your application** or **Continue**.

#### Additional Questions step
- Use the **Default Answers** table above for any personal-data questions.
- For Yes/No eligibility questions (e.g. "Authorized to work in UAE?"), answer truthfully per defaults.
- For free-text questions (e.g. "Why are you interested?"), write a 2-3 sentence answer tailored to the JD if optional. Skip if optional and short on time.

#### Location fields (typeahead comboboxes)
- Type `Dubai`, wait for dropdown, click the UAE option.

#### Review step
- Snapshot to verify all fields look correct.

#### Submit
- Click **Submit application**.
- Confirm success dialog. Click **Not now** / **Done** to dismiss.

### 3. External Company Portals

If "Apply on company website":
1. Click the button. Track which new tab opens.
2. Switch to the new tab if needed: `browser_tabs`.
3. Identify the portal type (Workday, Greenhouse, Lever, Taleo, SuccessFactors, SmartRecruiters, custom).
4. If sign-in required:
   - Try sign in with the credentials from `.env`.
   - If OTP is sent to email → use Gmail MCP to retrieve.
   - If only Google/LinkedIn SSO is offered → use those credentials.
5. Fill all required fields using the Default Answers table.
6. Upload the tailored resume PDF.
7. Submit. Mark `Applied`.

**Mark Manual only when:**
- CAPTCHA appears and is non-bypassable
- Portal requires phone OTP (we don't have access to user's phone)
- Account creation is blocked by reCAPTCHA
- Form genuinely needs unique user-only data the agent has no defaults for (e.g. specific certification numbers, prior employer references with phone numbers)

### 4. Update Excel Immediately After Each Job

```powershell
$xlPath = "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops\data\applications.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open($xlPath)
$ws = $wb.Sheets.Item("Applications")
$headers = @{}
for ($col = 1; $col -le 20; $col++) {
    $val = $ws.Cells(1, $col).Value2
    if ($val) { $headers[$val] = $col }
}
$idCol = $headers["#"]
$statusCol = $headers["Status"]
for ($row = 2; $row -le 300; $row++) {
    $cellVal = $ws.Cells($row, $idCol).Value2
    if ($null -eq $cellVal) { break }
    if ([int]$cellVal -eq [ID]) {
        $ws.Cells($row, $statusCol).Value2 = "[STATUS]"
        Write-Host "Updated row ${row}: ID=[ID] -> [STATUS]"
        break
    }
}
$wb.Save()
$wb.Close($false)
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "Done"
```

Replace `[ID]` with the job number and `[STATUS]` with one of: `Applied`, `Manual`, `Closed`, `Blocked`.

---

## Decision Rules — Updated (apply to most, mark Manual only when truly stuck)

| Situation | Action |
|-----------|--------|
| Easy Apply available, only contact + resume | Submit → `Applied` |
| Easy Apply with additional questions | Answer using Default Answers table → `Applied` |
| Easy Apply asks for salary/visa/nationality/notice period | Use Default Answers → `Applied` (do NOT mark Manual) |
| "Apply on company website" button | Open the external portal, attempt to apply |
| External portal: Workday/Greenhouse/Lever/SmartRecruiters | Sign in if needed (use email MCP for OTP), fill form, submit → `Applied` |
| External portal sends OTP to email | Retrieve via Gmail MCP → continue |
| External portal sends OTP to phone | `Blocked` |
| CAPTCHA appears | `Blocked` |
| "No longer accepting applications" | `Closed` |
| Page truly won't load after 2 retries + 5s wait | `Manual` |
| Form requires specific personal data the agent genuinely doesn't know (passport #, family book) | Skip the field if optional; `Blocked` only if mandatory |
| Portal completely broken / 404 / dead link | `Manual` |

**User instruction (2026-05-16):** "Only mark Manual if CAPTCHA or you're stuck. Otherwise I expect you to apply to most jobs. You have email MCP — get login codes from there if needed."

---

## SmartRecruiters / Workday / Greenhouse Forms

These external portals often have multi-step forms. Common quirks:
- **Location field**: typeahead — type city, click dropdown option
- **Resume parse**: portal extracts data from uploaded resume; review parsed fields before submitting
- **Work experience confirmation**: tick/confirm pre-parsed entries
- **Diversity / EEO questions**: select "Prefer not to say" if uncomfortable; otherwise answer honestly per defaults
- **Voluntary self-ID**: optional — skip unless required

Apply using the Default Answers table. Mark Manual only if a non-bypassable CAPTCHA / OTP appears.

---

## After All Jobs Are Done

```powershell
cd "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops"
powershell -ExecutionPolicy Bypass -File .\export-applications-xlsx.ps1
```

---

## Session End Summary Format

| # | Company | Role | Result |
|---|---------|------|--------|
| 120 | LanceSoft | AI Engineer | Applied ✓ |
| 121 | Virtusa | Data Scientist | Applied ✓ (via company portal, OTP from Gmail) |
| 122 | talabat | Sr. Data Scientist | Blocked (CAPTCHA on portal) |

Then: `N applied, N blocked, N closed`. Target: ≥80% Applied.
