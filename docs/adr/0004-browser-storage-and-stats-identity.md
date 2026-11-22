# ADR-0004 — One versioned localStorage payload; stats keyed by stable stack ID

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The app has no server. Progress, custom stacks, and settings must survive reloads and browser restarts, stay private, and remain recoverable. Cookies are capped at roughly 4 KB and exist to talk to a server; there is no server here. A future feature (“drill my recent misses”) needs a miss log, so the storage shape should support it from day one.

## Decision

- Use one `localStorage` key, `open-stacks-trainer`, holding a single versioned JSON object.
- The payload has `schemaVersion: 1`, `settings`, `customStacks`, and `stats`.
- Stats are keyed by **stable stack ID**, never by name. Built-ins use fixed IDs; customs use `custom-<uuid>`. Renaming a custom stack preserves its ID and stats.
- Every graded answer is persisted immediately (write-through).
- Recent misses are capped at the newest 20, with card, position, direction, and ISO timestamp.
- Practice days are one entry per local calendar date (`YYYY-MM-DD`), with answered and correct counts.
- A backup contains settings, custom stacks, and stats. Restore **replaces** everything after confirmation; it never merges.
- A newer `schemaVersion` must not be overwritten. Corrupt storage must not be silently wiped; the user must explicitly reset it. Storage-unavailable or quota errors degrade to an in-memory session with a visible warning.
- No cookies, no IndexedDB, no server, no analytics.

## Consequences

- Same-browser persistence with a privacy story that is easy to explain: nothing leaves the browser.
- Stable IDs make renames and backups safe.
- The miss log supports a future “drill my recent misses” mode without a schema change.
- Backup/restore is the only way to move data between browsers, which is acceptable for v1.
- The write-through approach costs a small `JSON.stringify` per answer; at 52 answers per session this is negligible.
