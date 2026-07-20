# OpenAI Build Week submission

## Name

**Resonance: The Living Song**  
Spanish: **Resonancia: El Canto Vivo**

## One-line pitch

A bilingual musical adventure where children restore living worlds by listening, composing, comparing ideas with an AI mentor, and turning sound into visible care.

## Short description

Music education often separates theory from imagination: learners identify an interval, memorize a chord, and leave the exercise behind. Resonance turns the same skills into a cooperative-feeling adventure. In the working prototype, players uncover a C-major triad in Grandma Luma's house, create a melody that restores the Air world, receive constrained feedback and a playable variation from an OpenAI musical mentor, and help an octopus restore Water by recognizing chord qualities and rebuilding a progression.

The four-world framework connects music with ecosophy: Air is imagination, Water is feeling, Fire is perseverance, and Earth is materialization. Nature is not background decoration; attentive musical actions visibly change the player's relationship with each world.

## The problem

Beginning musicians need repetition, but repetitive drills can lose story, agency, and emotional meaning. Families and teachers also need experiences that are safe for children, understandable without prior theory, and useful even when AI or accounts are unavailable.

## The solution

Resonance embeds ear training, harmony, composition, and reflection inside a visual journey:

1. **Listen** to a musical clue.
2. **Create or reconstruct** the idea through play.
3. **Compare** the player's choice with an audible variation.
4. **Restore** a living environment and carry the concept forward.

The current submission contains two complete worlds and communicates the larger four-world arc without pretending Fire and Earth are finished.

## How OpenAI is used

Echo, the Air world's musical mentor, receives a tightly constrained representation of the player's composition: tempo, melodic contour, one to three instruments, language, scene ID, and an anonymous local UUID. The Responses API returns structured educational feedback plus a valid playable variation. Players can immediately hear **My song** and **Echo's variation**, making the model's contribution observable instead of merely textual.

The implementation uses the official OpenAI JavaScript SDK, Structured Outputs validated with Zod, `store: false`, no retries, a short timeout, and a small output ceiling. Any missing key, timeout, refusal, rate limit, or malformed answer returns a disclosed curated fallback with the same contract. The game remains playable and honest under failure.

Water is intentionally deterministic and uses no AI. This reserves model calls for the moment where generation provides real pedagogical value.

## Safety, privacy, and cost

- No login is required.
- No name, email, free text, microphone input, voice recording, or location is collected.
- Progress and the latest response stay in browser storage.
- A saved response prevents repeat calls after reload.
- Server validation rejects unknown fields and oversized payloads.
- Rate limiting, timeout, and fallback behavior bound cost and failure.
- The 90-second judge route makes zero model calls.

## Why it matters

The product is designed for ages 8–15 as its clearest first audience, while using universal interaction and bilingual copy that remain welcoming to families and adult beginners. Its educational ambition is broader: rhythm, melody, harmony, intervals, chords, scales, composition, notation, solfège, ear training, and intonation can each become a mechanic inside the same living-world grammar.

## Technical stack

- Next.js 16 App Router, React 19, and TypeScript
- Tone.js browser synthesis; no copyrighted audio samples
- OpenAI Responses API and Zod Structured Outputs
- Vitest evaluation and contract suite
- Vercel deployment with server-only encrypted secrets
- One persistent client scene machine for uninterrupted interactive audio

## What Codex contributed

The team used OpenAI Codex as an implementation partner across product scoping, architecture, bilingual copy, interaction design, code, tests, evaluation cases, safety boundaries, documentation, browser playtesting, and deployment. Human direction supplied the musical pedagogy, artistic world, ecosophic purpose, and product decisions.

## Demo

- Product: [resonancia-canto-vivo.vercel.app](https://resonancia-canto-vivo.vercel.app)
- Judge guide: [open the Field Guide](https://resonancia-canto-vivo.vercel.app/?guide=1)
- Deterministic Spanish challenge: [Coral Cove in Spanish](https://resonancia-canto-vivo.vercel.app/?challenge=coral-cove&lang=es)
- Health: [deployment status](https://resonancia-canto-vivo.vercel.app/api/health)

## Demo narration · 30 seconds

“Resonance turns music practice into a living journey. You first hear and uncover a major triad, then compose a real melody in the Air world. Echo uses OpenAI to explain your musical choice and create a structured variation you can hear immediately. In Water, you recognize major and minor colors and rebuild an ocean current with Octavia. It is bilingual, account-free, privacy-minimal, and designed so every act of attentive listening restores a world.”

## Honest limitations and next step

This Build Week release proves the single-player learning loop in Air and Water. Fire, Earth, live teams, classroom accounts, microphone-based intonation, and multiplayer “impostor” modes remain future work. The next validation is a small supervised study with music teachers and students, measuring completion, replay, concept recall, and whether players can explain how one compositional change affected what they heard.

## Submission checklist

- [ ] Confirm final production URL and video are public.
- [ ] Paste the one-line pitch and short description.
- [ ] Include OpenAI use, privacy boundary, and fallback behavior.
- [ ] Add repository URL if the submission permits it.
- [ ] Add demo video and one desktop screenshot.
- [ ] Test the quick judge route in a signed-out browser.
- [ ] Verify billing limit and project access before judging begins.
