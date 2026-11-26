# 02 — Offline precache and update flow

**What to build:** Make cold starts work offline after one online load, and surface a polite, non-blocking **New version available · Reload** pill that never appears during an active training session.

**Blocked by:** `01 — PWA setup and manifest`.

**Status:** ready-for-agent

- [ ] The first successful production load installs the worker and precaches the complete build.
- [ ] A cold start with no network serves the cached shell; training, stats, My Stacks, the editor, import, backup export, and restore work offline.
- [ ] An offline reload keeps all graded answers, settings, stats, and custom stacks because persistence stays in `localStorage`.
- [ ] `onNeedRefresh` sets an update flag; the shell renders a small, non-modal **New version available · Reload** pill away from the primary controls.
- [ ] The pill never auto-reloads, never blocks input, and never appears on the training screen while a session is active; it waits for a non-training screen or the end of the session.
- [ ] Tapping **Reload** calls `updateSW(true)` and reloads into the new version; ignoring the pill keeps the current version with no forced skip-waiting.
- [ ] A pure route-based predicate decides update-pill visibility and has a unit test for an active training session versus other routes.
- [ ] If registration fails, the app keeps working online with no user-visible error and no console noise.
- [ ] Manual update check: a new build raises the pill on menu, summary, stats, and settings; the pill is absent mid-session; Reload swaps builds without losing graded answers.
- [ ] Manual offline check: load once online, switch to airplane mode, close and reopen the app, train a full session, open Stats, and export a backup.
- [ ] Typecheck, tests, build, and the stack verifier pass; the dev server registers no service worker.
