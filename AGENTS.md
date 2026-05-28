# Career-Ops for Codex

Read `CLAUDE.md` for all project instructions, routing, and behavioral rules. They apply equally to Codex.

Key points:
- Reuse the existing modes, scripts, templates, and tracker flow — do not create parallel logic.
- Store user-specific customization in `config/profile.yml`, `modes/_profile.md`, or `article-digest.md` — never in `modes/_shared.md`.
- Codex may submit an application only after the user has explicitly authorized submission for the specific application or batch and has had a chance to review the application data. Stop for CAPTCHAs, OTPs, password prompts, or any field requiring user-only judgment.

For Codex-specific setup, see `docs/CODEX.md`.
