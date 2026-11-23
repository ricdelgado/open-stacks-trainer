# 01 — Prevent double-tap zoom

**What to build:** A phone user can tap training controls twice quickly without the page zooming, while pinch-to-zoom still works.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] `touch-action: manipulation` is applied to the app shell and interactive controls, including buttons, links, card chips, position cells, suit tabs, inputs, selects, and dialogs.
- [ ] A double tap on Answer, Missed, Got it, a training card, an editor card, or an editor position does not zoom the page on iOS Safari or Android Chrome.
- [ ] Pinch-to-zoom still works on both platforms.
- [x] The viewport meta tag does not set `maximum-scale` or `user-scalable=no`.
- [x] No JavaScript double-tap or `touchend` cancellation is added.
- [x] Keyboard behavior, focus styles, tap-target sizes, and visual design are unchanged.
- [ ] The manual check covers menu, training, stats, and editor at phone width; settings is added to the check when that screen exists.
- [x] Typecheck, tests, build, and the stack verifier pass.
- [ ] No console errors appear during the manual check.

## Resolution

Added one rule to `src/styles.css` (no JavaScript, no viewport change):

```css
.app,
button,
a,
input,
select,
textarea {
  touch-action: manipulation;
}
```

Card chips, position cells, and suit tabs are all `<button>` elements, so the
generic selectors cover every interactive control on every screen. `manipulation`
disables double-tap zoom while keeping pinch-to-zoom. Remaining unchecked items
require the human check on a real phone after the Pages deploy.
