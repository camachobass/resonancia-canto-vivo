# Day 4 · Build Week release

Day 4 turns the two-world prototype into a submission-ready experience. The release does not add another unfinished world; it makes the existing journey understandable, accessible, demonstrable, and safe to share.

## Release promise

A new player can understand the musical goal, complete a meaningful challenge, and explain what OpenAI adds—all within three minutes.

## Final scope

- A bilingual Field Guide available from every scene.
- A 90-second judge route that enters Water without a paid model request.
- A compact 0/4 world-restoration indicator.
- Persistent sound preference and automatic audio stop when the page loses focus.
- Keyboard focus transfer and live objective announcements between scenes.
- Touch targets, safe-area spacing, reduced-motion support, and responsive guide layouts.
- Branded loading state, installable web-app manifest, and social preview image.
- Submission copy, demo script, verified screenshots, and a recorded browser demo.

## Judge routes

### Full product journey · about 3 minutes

1. Open the house and listen to the C–E–G pattern.
2. Touch the clock, sofa, and trunk in that order.
3. Enter Air, choose a tempo, melodic contour, and up to three instruments.
4. Preview the composition and awaken the portal.
5. Compare the original with Echo's structured variation.
6. Return to the atlas, enter Water, classify three chords, and reconstruct the current.

This route makes one server-side mentor request when the Air composition is offered. If OpenAI is unavailable, the same validated interface uses a clearly labeled curated fallback.

### Quick judge demo · about 90 seconds

Open `/?guide=1`, select **90-second Water demo**, and complete the listening and harmony rounds. It is deterministic, needs no account, and makes no OpenAI request.

## Privacy and cost boundary

- The browser sends only constrained musical controls, interface language, a scene ID, and a random local session UUID.
- It never sends a name, email, voice recording, microphone stream, location, or free-form child text.
- The model response is cached in browser progress so reloads do not repeat a paid request.
- Water challenges are curated and deterministic; replay and shared links do not use AI.
- The mentor endpoint has schema validation, payload limits, timeouts, no retries, and rate limiting.

## Definition of done

- [x] Lint, TypeScript, 29 unit/evaluation tests, and production build pass.
- [x] Full desktop journey passes with no console errors.
- [x] Quick demo passes at 390 × 844 with keyboard/touch-safe controls.
- [x] Reduced-motion and viewport-resize checks pass.
- [x] Manifest, social image, health endpoint, and production URL respond successfully.
- [x] No secret is committed or exposed to the browser bundle.
- [x] Final video and screenshots exist in `artifacts/`.

Verified against deployment `dpl_sCNWFWRJ55xxzGk5CRCvtLWpY28k` on July 20, 2026.
