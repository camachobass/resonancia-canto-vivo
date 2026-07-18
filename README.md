# Resonance: The Living Song · Resonancia: El Canto Vivo

A bilingual musical adventure for OpenAI Build Week. Players restore living worlds by listening, composing, and turning musical ideas into visible change.

Una aventura musical bilingüe para OpenAI Build Week. Los jugadores restauran mundos vivos al escuchar, componer y convertir ideas musicales en cambios visibles.

**Play the Day 1 prototype:** [resonancia-canto-vivo.vercel.app](https://resonancia-canto-vivo.vercel.app)

## Day 1 playable loop

1. Hear C–E–G in Grandma Luma's house and find the three sounding objects in order.
2. Open the ecosophic atlas of Air, Water, Fire, and Earth.
3. Compose a four-bar dog-walk by choosing tempo, melodic contour, and instruments.
4. Preview the real synthesized music and offer it to the Air portal.
5. Receive curated educational feedback and see the world awaken.

Progress and language are stored locally. English is the default; Spanish is available from every scene.

## Verified prototype

![Resonance welcome screen](artifacts/welcome-desktop.png)

The full house → atlas → composition → Air portal loop was browser-tested at desktop size and at 390×844. The mobile Spanish view is included in [`artifacts/welcome-mobile-es.png`](artifacts/welcome-mobile-es.png), and the completed portal in [`artifacts/launch-desktop.png`](artifacts/launch-desktop.png).

## Run locally

Requires Node.js 20.9 or newer.

The repository pins Node 22 in `.nvmrc`, the recommended local version for the team.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Audio begins only after a player gesture, as required by browsers.

## Quality checks

```bash
npm run check
```

## Architecture

- Next.js App Router + React + TypeScript
- Tone.js, loaded lazily in the browser after interaction
- Zod validation for the mentor endpoint
- Vitest for musical mapping, schema, and bilingual copy
- One client-side scene state machine so the audio context survives transitions
- `localStorage` key `resonancia:v1` for prototype progress

### Prototype API

- `GET /api/health`
- `POST /api/mentor/feedback`

The Day 1 mentor is intentionally a **mock with curated responses** and its response includes `source: "mock"`. It does not call GPT and the UI never represents it as live AI. A later iteration can replace the implementation behind the same validated contract once an API key and safety/evaluation plan are ready.

## Built with Codex

The product concept, scope, architecture, implementation, copy, tests, and documentation were developed collaboratively with OpenAI Codex during Build Week. The human team directed the musical pedagogy, worldbuilding, ecosophic purpose, and product decisions.

## Ecosophic direction

The four worlds connect musical learning with human capacities: Air/imagining, Water/feeling, Fire/persevering, and Earth/materializing. The prototype avoids treating nature as decoration: the player's act of attentive listening creates a reciprocal, visible effect in the environment.

## License

MIT. See [LICENSE](LICENSE), [ASSET_LICENSES.md](ASSET_LICENSES.md), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
