# Day 3 — Water becomes a replayable musical world

## Outcome

Day 3 turns the Day 2 vertical slice into a small expandable game. Restoring Air unlocks Water, where Octavia the octopus teaches chord color and harmonic order through listening, touch, and immediate synthesized sound.

The complete loop is:

> restore Air → unlock Water → identify chord color → reconstruct a progression → earn pearls → challenge a friend

Water is deterministic and makes no additional OpenAI requests. This keeps the public prototype inexpensive while the existing Echo mentor remains the intentional GPT-5.6 learning moment.

## Player experience

1. Returning from the restored Air portal marks Air as complete in the atlas.
2. The Water portal unlocks and introduces Octavia.
3. The player hears three hidden triads and classifies each as:
   - bright coral / major;
   - quiet deep / minor.
4. The game explains the major or minor third after every answer.
5. Six tentacles represent the diatonic triads of C major: C, Dm, Em, F, G and Am.
6. The player hears a three-chord current and reconstructs it in order.
7. Completion awards up to three harmony pearls:
   - finish the progression;
   - recognize at least two chord colors;
   - rebuild the progression on the first try.
8. The player can replay a different current or share the exact challenge through an anonymous URL.

## Community without accounts

There are four curated challenge seeds. A shared URL contains only the challenge identifier and language, for example:

```text
?challenge=turtle-bay&lang=es
```

No player name, email, score, recording, session identifier, or musical response is placed in the URL. A recipient enters the Water introduction directly and receives the same ear-training targets and harmonic progression.

## Musical system

| Tentacle | Roman numeral | Quality | Notes |
| --- | --- | --- | --- |
| C | I | Major | C–E–G |
| Dm | ii | Minor | D–F–A |
| Em | iii | Minor | E–G–B |
| F | IV | Major | F–A–C |
| G | V | Major | G–B–D |
| Am | vi | Minor | A–C–E |

Tone.js renders both isolated triads and complete progressions. Every interaction begins with a player gesture, so browser audio policies remain satisfied.

## Persistence and compatibility

- The existing `resonancia:v1` browser record is extended instead of replaced.
- Old Day 2 saves infer that Air is restored when they contain the launch phase or mentor result.
- Water stores its current stage, listening result, streak, selected chords, attempts, personal-best pearls, completed runs, and active challenge.
- Starting over clears the challenge query and all journey progress.

## Definition of done

- Air completion visibly unlocks Water in the atlas.
- Water has an introduction, three listening rounds, a harmony reconstruction, and a completion scene.
- All six triads are playable and labeled with their Roman numeral.
- Major/minor feedback is bilingual and pedagogically accurate.
- A correct progression is order-sensitive.
- Pearl scoring and personal bests persist locally.
- Shared challenge links reproduce the same challenge without personal data.
- English and Spanish contain equivalent Water UI contracts.
- Day 1 and Day 2 behavior remains working.
- Lint, TypeScript, unit tests, production build, desktop browser, mobile browser, Git push, Vercel deployment, and production smoke checks pass.

## Deferred

- Accounts, global leaderboards, and a persistent social graph.
- Real-time multiplayer or impostor mechanics.
- Microphone input, pitch detection, and singing assessment.
- Procedural or AI-generated harmony challenges.
- Fire and Earth worlds.
