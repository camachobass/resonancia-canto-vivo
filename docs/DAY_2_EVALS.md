# Day 2 mentor evaluations

## Purpose

Echo should teach one concrete musical relationship without inventing audio analysis, and every suggestion must be playable by the controls already visible in the game.

## Automated set

The Vitest suite contains six bilingual fixtures:

| Language | Tempo | Contour | Instruments |
| --- | ---: | --- | ---: |
| English | 72 | rising | 1 |
| English | 96 | wave | 2 |
| English | 120 | falling | 3 |
| Spanish | 72 | falling | 1 |
| Spanish | 96 | rising | 2 |
| Spanish | 120 | wave | 3 |

Each fixture must:

1. Pass the shared Zod response schema.
2. Name the chosen contour and number of instruments.
3. Produce a valid variation different from the original.
4. Avoid claims about microphones, recordings, or performances.

Run the complete offline evaluation with:

```bash
npm run test
```

No OpenAI request is made by the automated suite.

## Failure simulations

Injected generators cover:

- valid Structured Output;
- refusal/API exception;
- malformed output;
- a generator that never resolves;
- a missing API key at the route boundary;
- malformed and oversized request bodies.

Every model-side failure resolves to the schema-valid, visibly disclosed curated fallback.

## Minimal live smoke test

One Spanish request was sent through the local route with a 96 BPM wave contour and pluck plus bass. It returned HTTP 200, `source: "openai"`, `model: "gpt-5.6-luna"`, and a playable variation that preserved tempo and contour while changing bass to flute.

This smoke test is deliberately not part of CI so routine validation consumes zero OpenAI tokens.
