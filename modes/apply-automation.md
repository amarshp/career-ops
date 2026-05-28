# Apply Automation Playbook

This file teaches the LLM how to execute automated job applications using Playwright browser automation and CapSolver CAPTCHA solving. Read this file at the start of any apply session.

---

## Prerequisites

- Playwright MCP server connected (provides `browser_*` tools)
- CapSolver API key in `.env` at `C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\.env` (variable: `CAPSOLVER_API_KEY`)
- Resume at `output/amarsh-resume.pdf`
- `modes/_profile.md` loaded for constraints and portal-specific configs

---

## Core Automation Flow (per job)

```
0. CLAIM NUM      → Run: node scripts/claim-num.mjs  (use this num for report + TSV + JD filenames)
1. DEDUP CHECK    → Search applications.md for company+role match → STOP if found
2. NAVIGATE       → browser_navigate to the job posting URL
3. SNAPSHOT       → browser_snapshot to read page content
4. SAVE JD        → Extract JD content from snapshot → write to jds/{num}-{slug}.md
5. SCORE          → Quick-score the role against _profile.md criteria → STOP if < 3.5/5
6. FILL FORM      → browser_fill_form with standard fields
7. UPLOAD CV      → browser_click on upload area → browser_file_upload
8. SOLVE CAPTCHA  → CapSolver API (if reCAPTCHA/hCaptcha present)
9. INJECT TOKEN   → browser_evaluate to inject token into textarea
10. SUBMIT        → browser_click submit button
11. VERIFY        → browser_snapshot to confirm success message
12. RECORD        → Write TSV to batch/tracker-additions/
```

> **Parallel sessions:** If multiple CC windows are running simultaneously (different regions),
> ALWAYS use `node scripts/claim-num.mjs` for the report number — never compute max(reports/)+1 manually.
> See OPERATIONS.md → "Parallel Sessions" for the full parallel-safe rules.

---

## Tool Reference

### browser_navigate
Navigate to a URL. Use before accessing any new page.
```
browser_navigate({ url: "https://careers.example.com/jobs/role-slug/" })
```

### browser_snapshot
Capture accessibility tree of the current page. Returns all interactive elements with `ref` identifiers. Use this to:
- Read the JD content
- Find form field refs
- Verify submission success

### browser_fill_form
Fill multiple form fields in one call. Field types: `textbox`, `combobox`, `checkbox`, `radio`.
```
browser_fill_form({ fields: [
  { name: "First Name", type: "textbox", ref: "e129", value: "Amarsh" },
  { name: "Country", type: "combobox", ref: "e163", value: "India" }
]})
```

### browser_click
Click an element by ref. Used for upload areas and submit buttons.
```
browser_click({ ref: "e189", element: "Submit Application button" })
```

### browser_file_upload
Upload file(s) after a file chooser dialog appears (triggered by clicking an upload area).
```
browser_file_upload({ paths: ["C:\\Users\\Amarsh\\OneDrive\\Documents\\Personal\\Projects\\JobApplicationAI\\career-ops\\output\\amarsh-resume.pdf"] })
```

### browser_evaluate
Execute JavaScript on the page. Used for token injection. MUST be single-line function string.
```
browser_evaluate({ function: "() => { /* code */ }" })
```

---

## Applicant Data (standard fields)

| Field | Value |
|-------|-------|
| First Name | Amarsh |
| Last Name | Pedapati |
| Email | pedapatiamarsh@gmail.com |
| Phone | 9876543210 |
| Country Code | India (+91) |
| Nationality | India |
| Highest Qualification | Masters Degree |
| Years of Experience | 5-10 (or "5+ years" depending on form) |
| Current Company | OpenText |
| Current Title | Senior AI Engineer |
| Location | India (willing to relocate) |
| Visa/Sponsorship | Yes, I will require sponsorship |
| LinkedIn | https://www.linkedin.com/in/amarshp/ |
| GitHub | https://github.com/amarshp |
| Resume path | output/amarsh-resume.pdf |

---

## CAPTCHA Solving: CapSolver

### When to use
- reCAPTCHA v2 (visible or invisible) detected in page snapshot (look for iframe with "recaptcha" or checkbox)
- hCaptcha detected (look for iframe with "hcaptcha")

### Step 1: Read API key

```powershell
$apiKey = (Get-Content "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\.env" | Select-String "CAPSOLVER_API_KEY=(.+)").Matches.Groups[1].Value
```

Or use the key directly from `_profile.md` if documented there for the specific portal.

### Step 2: Create task

```powershell
$body = @{
    clientKey = "$apiKey"
    task = @{
        type = "ReCaptchaV2TaskProxyless"
        websiteURL = "https://careers.example.com/jobs/role-slug/"
        websiteKey = "SITE_KEY_HERE"
        isInvisible = $true
    }
} | ConvertTo-Json -Depth 3
$r = Invoke-RestMethod -Uri "https://api.capsolver.com/createTask" -Method Post -Body $body -ContentType "application/json"
Write-Output "TaskId: $($r.taskId)"
```

**Task types by CAPTCHA:**
| CAPTCHA | Task type | Extra params |
|---------|-----------|--------------|
| reCAPTCHA v2 invisible | `ReCaptchaV2TaskProxyless` | `isInvisible = $true` |
| reCAPTCHA v2 checkbox | `ReCaptchaV2TaskProxyless` | (no isInvisible) |
| reCAPTCHA v3 | `ReCaptchaV3TaskProxyless` | `pageAction = "submit"` |
| hCaptcha | `HCaptchaTaskProxyless` | (none) |

### Step 3: Wait and poll

```powershell
Start-Sleep -Seconds 18
$body2 = @{ clientKey = "$apiKey"; taskId = $r.taskId } | ConvertTo-Json
$r2 = Invoke-RestMethod -Uri "https://api.capsolver.com/getTaskResult" -Method Post -Body $body2 -ContentType "application/json"
Write-Output "Status: $($r2.status)"
Write-Output "Token: $($r2.solution.gRecaptchaResponse)"
```

If status is not "ready", wait 5 more seconds and poll again (max 3 retries).

### Step 4: Inject token

**For reCAPTCHA:**
```javascript
() => { const token = "TOKEN_HERE"; const textareas = document.querySelectorAll('textarea[name="g-recaptcha-response"]'); textareas.forEach(ta => { ta.value = token; }); return 'Injected into ' + textareas.length + ' textarea(s)'; }
```

**For hCaptcha:**
```javascript
() => { const token = "TOKEN_HERE"; document.querySelector('[name="h-captcha-response"]').value = token; document.querySelector('[name="g-recaptcha-response"]').value = token; return 'Injected'; }
```

### Finding the site key

From the page snapshot, look for the reCAPTCHA iframe. If not visible, use browser_evaluate:
```javascript
() => { const el = document.querySelector('.g-recaptcha') || document.querySelector('[data-sitekey]'); return el ? el.getAttribute('data-sitekey') : 'not found'; }
```

Or check the iframe src URL for `k=SITE_KEY`.

---

## Portal-Specific Playbooks

### MBZUAI (careers.mbzuai.ac.ae)

**ATS:** WordPress + WPForms
**CAPTCHA:** reCAPTCHA v2 invisible, site key: `6LdUY8sqAAAAAMg28gSpgYJZPr2wgngteWKmDZEs`
**Form fields:** First Name, Last Name, Email, Phone (India +91), Highest Qualification, Years of Experience, Nationality, Upload CV, Upload Cover Letter (optional)
**Notes:**
- India (+91) phone country persists within a browser session once set
- Nationality dropdown defaults to "United Arab Emirates" on each page load; must explicitly select "India"
- After upload, wait for the file preview to appear before submitting
- Success message: "Thank you. Your application has been successfully submitted."

### Greenhouse (job-boards.eu.greenhouse.io / boards.greenhouse.io)

**ATS:** Greenhouse
**CAPTCHA:** Usually none
**Form fields:** Varies by company. Common: First Name, Last Name, Email, Phone, Resume upload, LinkedIn, Cover Letter, custom questions
**Notes:**
- URL pattern: `job-boards.eu.greenhouse.io/{company}/jobs/{id}` or `boards.greenhouse.io/{company}/jobs/{id}`
- Some have "Apply" button that opens the form on the same page
- File upload uses standard file chooser
- Custom questions may include dropdowns, text areas, yes/no
- Success: redirects to a confirmation page or shows "Application submitted"

### Ashby (jobs.ashbyhq.com)

**ATS:** Ashby
**CAPTCHA:** Usually none (Cloudflare Turnstile on some)
**Form fields:** Similar to Greenhouse. Name, Email, Phone, Resume, LinkedIn, custom questions.
**Notes:**
- URL pattern: `jobs.ashbyhq.com/{company}/{job-id}`
- Clean, modern UI. Fields are usually well-labeled in the snapshot.
- Some have multi-step forms (personal info, then questions)

### Lever (jobs.lever.co)

**ATS:** Lever
**CAPTCHA:** Often hCaptcha (BLOCKED for Mistral AI; try others case-by-case)
**Form fields:** Name (single field or split), Email, Phone, Resume, LinkedIn, URLs, custom questions
**Notes:**
- URL pattern: `jobs.lever.co/{company}/{job-id}`
- If hCaptcha appears, attempt CapSolver with HCaptchaTaskProxyless
- If multi-round hCaptcha or persistent failure, skip and mark as blocked

### Workable (apply.workable.com)

**ATS:** Workable
**CAPTCHA:** Cloudflare Turnstile (BLOCKED, cannot automate)
**Action:** Skip. Mark as "Portal blocked (Workable/Turnstile)" in notes.

### SmartRecruiters (jobs.smartrecruiters.com)

**ATS:** SmartRecruiters
**CAPTCHA:** Cloudflare (BLOCKED)
**Action:** Skip.

### Workday (*.myworkdayjobs.com)

**ATS:** Workday
**Notes:** Requires account creation, complex multi-page forms, sometimes in maintenance. Skip unless user explicitly requests and provides credentials.

### Custom Company Portals

For portals not listed above:
1. Navigate and snapshot
2. Identify form structure from the snapshot
3. Look for CAPTCHA (reCAPTCHA, hCaptcha, Turnstile)
4. If Turnstile: skip (cannot solve)
5. If reCAPTCHA/hCaptcha: use CapSolver
6. Fill form using the field refs from snapshot
7. Upload resume
8. Submit and verify

---

## Region Tagging (MANDATORY)

Every TSV written must have the notes field starting with a region tag:

| Region | Tag |
|--------|-----|
| UAE (Dubai, Abu Dhabi, etc.) | `[UAE]` |
| Singapore | `[SGP]` |
| Saudi Arabia | `[KSA]` |
| USA Remote | `[USA]` |
| Other Gulf (Qatar, Kuwait, Bahrain, Oman) | `[GULF]` |

Example notes field: `[SGP] Applied via Greenhouse. Senior ML Engineer at Grab. Singapore, hybrid.`

This is the only filter mechanism for region in `data/applications.md`. Do not omit it.

To scan only one region, read portals.yml and filter by `region: SGP` (or relevant tag).

## Batch Apply Sequence (multiple jobs)

When running a batch (e.g., "Apply to 50 Singapore jobs"):

### Phase 1: Discovery
1. Scan portals or use a pre-built list of URLs
2. Score each role quickly (title + requirements vs profile)
3. Filter: score >= 3.5, not already applied, not blocked portal, job age <= 30 days

### Phase 2: Apply loop
For each passing job, in order:
```
1. Check dedup against applications.md
2. Navigate to job page
3. Snapshot and extract JD → save to jds/
4. Fill form
5. Upload CV
6. Solve CAPTCHA (if present)
7. Inject token (if CAPTCHA)
8. Submit
9. Verify success
10. Write TSV
```

### Phase 3: Wrap-up
```
1. node merge-tracker.mjs
2. powershell -ExecutionPolicy Bypass -File .\export-applications-xlsx.ps1
3. Generate session index in batch/session-logs/
4. Clean up temp files (captcha PNGs, merged TSVs)
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Cloudflare Turnstile detected | Skip the portal. Note in tracker as "Portal blocked" |
| CapSolver returns "failed" | Retry once with a new task. If fails again, skip the job |
| Form validation error after submit | Snapshot to read error messages, fix field values, resubmit |
| Page loads but no form visible | Scroll down or look for "Apply" button to reveal the form |
| File upload fails | Try clicking the upload area again, then upload. If persistent, skip |
| "Position no longer available" | Mark as Discarded in tracker, do not apply |
| Multi-round CAPTCHA (visual challenge) | Skip. Mark as "CAPTCHA unsolvable" |
| Login/account required | Skip unless credentials are available |
| Rate limited | Wait 60 seconds, then continue with next job. Return to this one later |

---

## JD Extraction

From the browser snapshot, extract:
- Job title (usually an h1 or heading)
- Location
- Key responsibilities (bullet points)
- Requirements (bullet points)
- Nice-to-haves (if listed)
- Compensation (if listed)

Write to `jds/{num}-{company-slug}-{role-slug}-{YYYY-MM-DD}.md` using the template in OPERATIONS.md.

If the snapshot is too long to parse cleanly, use browser_evaluate to extract text:
```javascript
() => { const jd = document.querySelector('.job-description, .posting-page, article, main'); return jd ? jd.innerText.substring(0, 5000) : 'JD container not found'; }
```

---

## Session Persistence

Between apply sessions, context is lost. Everything the next session needs must be in files:

| What | Where |
|------|-------|
| Constraints, targeting, blocked portals | `modes/_profile.md` |
| Automation playbook (this file) | `modes/apply-automation.md` |
| Apply workflow + dedup Step 0 | `modes/apply.md` |
| Current application state | `data/applications.md` + `data/applications.xlsx` |
| Session history | `batch/session-logs/` |
| Operational procedures | `OPERATIONS.md` |
| System rules and enforcement | `CLAUDE.md` (Apply Session Rules section) |

A fresh session with "Start X apply batch" should:
1. CLAUDE.md auto-loads (has enforcement rules + pointer to this file)
2. Read this file (`modes/apply-automation.md`) for execution knowledge
3. Read `modes/_profile.md` for targeting and constraints
4. Read `data/applications.md` for dedup baseline
5. Begin the batch loop
