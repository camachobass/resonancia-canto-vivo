import type { CompositionConfig } from "./game";
import { melodyFor } from "./game";

type ToneModule = typeof import("tone");
let tonePromise: Promise<ToneModule> | null = null;
let muted = false;

async function getTone() {
  tonePromise ??= import("tone");
  const Tone = await tonePromise;
  await Tone.start();
  Tone.getDestination().mute = muted;
  return Tone;
}

export async function setMuted(value: boolean) {
  muted = value;
  if (tonePromise) {
    const Tone = await tonePromise;
    Tone.getDestination().mute = value;
  }
}

export async function stopAll() {
  if (!tonePromise) return;
  const Tone = await tonePromise;
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
}

export async function playNote(note: string, duration = "8n") {
  const Tone = await getTone();
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.25, release: 0.7 },
  }).toDestination();
  synth.triggerAttackRelease(note, duration);
  window.setTimeout(() => synth.dispose(), 1200);
}

export async function playHousePattern() {
  const Tone = await getTone();
  const synth = new Tone.FMSynth({ harmonicity: 1.5 }).toDestination();
  const now = Tone.now();
  ["C4", "E4", "G4"].forEach((note, index) => {
    synth.triggerAttackRelease(note, "8n", now + index * 0.52);
  });
  window.setTimeout(() => synth.dispose(), 2500);
}

export async function previewComposition(config: CompositionConfig) {
  const Tone = await getTone();
  await stopAll();
  const transport = Tone.getTransport();
  transport.bpm.value = config.tempo;
  const nodes: Array<{ dispose: () => void }> = [];
  const parts: Array<{ dispose: () => void }> = [];
  const melody = melodyFor(config);

  if (config.instruments.includes("pluck")) {
    const synth = new Tone.PluckSynth().toDestination();
    nodes.push(synth);
    const sequence = new Tone.Sequence(
      (time, note) => synth.triggerAttack(note, time),
      melody,
      "4n",
    ).start(0);
    parts.push(sequence);
  }

  if (config.instruments.includes("flute")) {
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.12, decay: 0.15, sustain: 0.6, release: 1 },
    }).toDestination();
    nodes.push(synth);
    const sequence = new Tone.Sequence(
      (time, note) => note && synth.triggerAttackRelease(note, "8n", time),
      melody.map((note, index) => (index % 2 === 0 ? note.replace("4", "5") : null)),
      "4n",
    ).start(0);
    parts.push(sequence);
  }

  if (config.instruments.includes("bass")) {
    const synth = new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.03, decay: 0.2, sustain: 0.35, release: 0.5 },
    }).toDestination();
    nodes.push(synth);
    const bass = new Tone.Sequence(
      (time, note) => note && synth.triggerAttackRelease(note, "4n", time),
      ["C2", null, "F2", null, "G2", null, "C2", null],
      "4n",
    ).start(0);
    parts.push(bass);
  }

  if (config.instruments.includes("percussion")) {
    const drum = new Tone.MembraneSynth({ pitchDecay: 0.03 }).toDestination();
    nodes.push(drum);
    const beat = new Tone.Sequence(
      (time, hit) => hit && drum.triggerAttackRelease(hit, "16n", time),
      ["C2", null, "G1", null, "C2", null, "G1", null],
      "4n",
    ).start(0);
    parts.push(beat);
  }

  transport.loop = true;
  transport.loopEnd = "2m";
  transport.start();

  return () => {
    transport.stop();
    transport.cancel();
    parts.forEach((part) => part.dispose());
    nodes.forEach((node) => node.dispose());
  };
}
