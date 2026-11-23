# Mobile — prevent double-tap zoom

## Problem Statement

On a phone, two quick taps on a training control can trigger the browser’s double-tap zoom. Training requires many rapid taps on **Answer**, **Missed**, **Got it**, card faces, position cells, and navigation controls. An unexpected zoom interrupts the session and makes the next tap land in the wrong place.

## Solution

Use CSS `touch-action: manipulation` on the app shell and on interactive controls. This removes double-tap zoom while preserving pinch-to-zoom for accessibility. The viewport must not disable zoom, and no JavaScript gesture blocking is needed.

## User Stories

1. As a phone user, I want two quick taps on a training control to count as two taps, so that the page does not zoom during a session.
2. As a phone user, I want to tap **Answer**, **Missed**, and **Got it** rapidly without the layout moving, so that I can train at my own pace.
3. As a phone user, I want to select cards and positions in the editor without accidental zoom, so that building a stack is reliable.
4. As a low-vision user, I want pinch-to-zoom to keep working, so that I can enlarge the interface when needed.
5. As a desktop user, I want the change to have no visible effect on mouse interaction, so that nothing regresses.
6. As a keyboard user, I want shortcuts and focus behavior to stay unchanged.
7. As a maintainer, I want a simple, well-supported CSS solution, so that there is no gesture-detection code to maintain.
8. As a tester, I want a short manual device checklist, so that the fix is verified on real phone browsers.

## Implementation Decisions

- Apply `touch-action: manipulation` to the app shell and to interactive controls: buttons, links, card chips, position cells, suit tabs, selects, and inputs.
- `manipulation` keeps panning and pinch zoom and disables double-tap zoom.
- Do not change the viewport meta tag. Do not add `maximum-scale=1`, `user-scalable=no`, or any equivalent.
- Do not use JavaScript to cancel `touchend` or `dblclick`.
- Keep the existing minimum tap-target sizes and visual design. This is a behavior-only change.
- The fix must apply to every screen, including menu, training, summary, stats, My Stacks, import, editor, settings, and dialogs.

## Testing Decisions

- The primary check is manual on iOS Safari and Android Chrome: double-tap **Answer** and a card chip; the page must not zoom; pinch-to-zoom must still work.
- Add a small manual regression checklist for the highest-tap screens: training controls, editor card pool, editor position grid, and stats sort controls.
- No unit test is needed for CSS gesture behavior. Existing DOM tests should continue to pass.
- If the project later adds a browser smoke suite, include a phone-width check that repeated taps do not change the visual viewport scale.

## Out of Scope

- Disabling pinch zoom or any zoom accessibility feature.
- Changing desktop double-click behavior.
- PWA/offline behavior.
- A custom gesture-recognition layer.
- Changing layout, typography, or tap-target sizes.

## Further Notes

- `touch-action` is widely supported in current Safari, Chrome, Firefox, and Edge.
- If `touch-action` on the app shell alone is not sufficient on a specific browser, apply it directly to the interactive elements rather than disabling zoom.
- This feature is independent of the v2 training work and can ship first.
