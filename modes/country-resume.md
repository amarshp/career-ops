# Mode: country-resume — Country-Adapted Resume Layer

Generates a country-adapted resume layer that sits between the master `cv.md` and per-job tailoring.
The country layer handles norms the job-level tailoring cannot: photo policy, visa framing, length conventions, mandatory disclosures, and tone.

## When to use

- At the START of any new region session before generating any resumes
- When the user says "research [country] resume norms" or "set up for [country]"
- When switching from one region to another mid-session
- When the user says "update UAE/SGP/USA resume norms"

## The Three-Layer Resume Model

```
Layer 1: cv.md              → Master CV (source of truth, never modified)
Layer 2: country norms      → config/resume-norms/{region}.md (country rules, pre-researched)
Layer 3: per-job tailoring  → keyword injection, archetype framing, project reordering (modes/pdf.md)
```

Both Layer 2 and Layer 3 are applied at generation time — there is no intermediate "base resume file".
The country norms are INSTRUCTIONS that modify how Layer 3 works.

## Workflow

### Step 1 — Load existing norms

Check if `config/resume-norms/{region}.md` exists:
- **If yes**: load it and summarise the key rules for the session. Skip to Step 3.
- **If no**: proceed to Step 2 to research and create it.

Region codes: `uae`, `sgp`, `usa`, `ind`, `dach`, `fr`, `jp` (match the `[TAG]` in applications.md notes).

### Step 2 — Research country norms (only if norms file missing)

Use web search to research CURRENT recruiter expectations for the target country. Search for:
- `"{country} tech resume format 2025 expectations"`
- `"AI engineer resume {country} what recruiters want"`
- `"resume format {country} photo nationality work authorization"`

Extract and document:
1. **Mandatory fields**: what must be on the resume (visa status, nationality, work auth)
2. **Prohibited fields**: what must NOT be on it (USA: no photo/DOB/nationality)
3. **Length convention**: 1 page / 2 pages / up to 3 for senior
4. **Photo policy**: required / acceptable / discouraged / prohibited
5. **Work authorization framing**: exact wording recruiters expect
6. **Format**: A4 vs Letter
7. **Local tone/keywords**: anything region-specific (e.g., UAE prefers "UAE National sponsorship eligible" framing)
8. **ATS notes**: any country-specific ATS platforms (UAE: Bayt, NaukriGulf; SGP: MyCareersFuture)

Write the findings to `config/resume-norms/{region}.md` using the template below.

### Step 3 — Apply norms during resume generation

When `modes/pdf.md` or `generate-docx-resumes.ps1` runs for this region:

1. Read `config/resume-norms/{region}.md`
2. Apply mandatory fields to the header/summary section
3. Apply prohibited fields (omit anything banned)
4. Enforce length constraint
5. Add work authorization statement to summary or header
6. Use A4 or Letter per norms
7. Inject local ATS keywords where authentic

### Step 4 — Confirm with user

Before generating the first resume for a new region, show the user a 5-line summary:
> "Applying UAE norms: nationality included, photo omitted, relocation statement in summary, 2-page max, A4 format. Proceeding."

---

## Norms File Template

`config/resume-norms/{region}.md`:

```markdown
# Resume Norms: {REGION}
Last updated: {YYYY-MM-DD}
Source: [research notes / links]

## Mandatory inclusions
- ...

## Prohibited / omit
- ...

## Length
- ...

## Photo
- ...

## Work authorization statement
Exact wording to use in summary or header:
> "..."

## Format
- Paper: A4 / Letter
- ...

## ATS / portals
- ...

## Summary framing
Key phrases and tone specific to this market:
- ...

## Red flags to avoid
- ...
```

---

## Updating norms

Norms change. Re-run this mode for a region if:
- You're starting a batch 3+ months after the last update
- You've seen rejections that may be format-related
- The user says "refresh UAE/SGP/USA resume norms"

The mode will re-search, compare with the existing norms file, and update only what changed.
