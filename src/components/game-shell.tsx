"use client";

import { useEffect, useRef, useState } from "react";
import { playHousePattern, playNote, previewComposition, setMuted, stopAll } from "@/lib/audio-engine";
import {
  compositionSchema, copy, DEFAULT_COMPOSITION, HOUSE_SEQUENCE, mentorFeedbackSchema,
  mockMentorFeedback, sameComposition, SESSION_STORAGE_KEY, STORAGE_KEY,
  type CompositionConfig, type GamePhase, type GameProgress, type Instrument,
  type Language, type MentorFeedback,
} from "@/lib/game";

const notes = { clock: "C4", sofa: "E4", trunk: "G4" } as const;
const instrumentIcons: Record<Instrument, string> = { pluck: "✦", flute: "〰", bass: "●", percussion: "◈" };

export function GameShell() {
  const [language, setLanguage] = useState<Language>("en");
  const [phase, setPhase] = useState<GamePhase>("welcome");
  const [houseSolved, setHouseSolved] = useState(false);
  const [houseInput, setHouseInput] = useState<string[]>([]);
  const [houseStatus, setHouseStatus] = useState<"idle" | "wrong" | "solved">("idle");
  const [composition, setComposition] = useState(DEFAULT_COMPOSITION);
  const [mentor, setMentor] = useState<MentorFeedback | null>(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [muted, setIsMuted] = useState(false);
  const [playingVersion, setPlayingVersion] = useState<"original" | "variation" | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const stopPreview = useRef<null | (() => void)>(null);
  const houseStatusTimer = useRef<number | null>(null);
  const t = copy[language];

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const progress = JSON.parse(saved) as GameProgress;
          setLanguage(progress.language ?? "en");
          setPhase(progress.phase ?? "welcome");
          setHouseSolved(Boolean(progress.houseSolved));
          const savedComposition = compositionSchema.safeParse(progress.composition);
          const savedMentor = mentorFeedbackSchema.safeParse(progress.mentor);
          if (savedComposition.success) setComposition(savedComposition.data);
          if (savedMentor.success) setMentor(savedMentor.data);
        }
      } catch { window.localStorage.removeItem(STORAGE_KEY); }
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const progress: GameProgress = { language, phase, houseSolved, composition, mentor: mentor ?? undefined };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [composition, houseSolved, hydrated, language, mentor, phase]);
  useEffect(() => () => {
    stopPreview.current?.();
    if (houseStatusTimer.current) window.clearTimeout(houseStatusTimer.current);
  }, []);

  function stopMusic() {
    stopPreview.current?.(); stopPreview.current = null; void stopAll(); setPlayingVersion(null);
  }
  function go(next: GamePhase) { stopMusic(); setPhase(next); }
  function changeLanguage(next: Language) {
    if (next === language) return;
    setLanguage(next);
    setMentor(null);
  }
  async function togglePreview(version: "original" | "variation", config: CompositionConfig) {
    if (playingVersion === version) return stopMusic();
    stopMusic();
    stopPreview.current = await previewComposition(config);
    setPlayingVersion(version);
  }
  async function toggleMute() { const next = !muted; setIsMuted(next); await setMuted(next); }

  async function selectHouseObject(item: keyof typeof notes) {
    if (houseStatus === "solved") return;
    await playNote(notes[item]);
    const next = [...houseInput, item];
    if (item !== HOUSE_SEQUENCE[next.length - 1]) {
      setHouseInput([]); setHouseStatus("wrong");
      houseStatusTimer.current = window.setTimeout(() => setHouseStatus("idle"), 1600); return;
    }
    setHouseInput(next);
    if (next.length === HOUSE_SEQUENCE.length) { setHouseSolved(true); setHouseStatus("solved"); }
  }

  function toggleInstrument(instrument: Instrument) {
    const selected = composition.instruments.includes(instrument);
    if ((selected && composition.instruments.length === 1) || (!selected && composition.instruments.length === 3)) return;
    setMentor(null);
    setComposition((current) => {
      if (current.instruments.includes(instrument)) {
        if (current.instruments.length === 1) return current;
        return { ...current, instruments: current.instruments.filter((item) => item !== instrument) };
      }
      if (current.instruments.length === 3) return current;
      return { ...current, instruments: [...current.instruments, instrument] };
    });
  }

  function updateComposition(next: CompositionConfig) {
    if (sameComposition(composition, next)) return;
    stopMusic();
    setMentor(null);
    setComposition(next);
  }

  function getPlayerSessionId() {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(existing)) return existing;
    const sessionId = window.crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  }

  async function awakenWorld() {
    stopMusic();
    setPhase("launch");
    if (mentor) return;
    setMentorLoading(true);
    try {
      const response = await fetch("/api/mentor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: "dog-walk",
          language,
          playerSessionId: getPlayerSessionId(),
          composition,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error("Mentor request failed");
      const parsed = mentorFeedbackSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error("Mentor response was invalid");
      setMentor(parsed.data);
    } catch {
      setMentor(mockMentorFeedback(language, composition));
    } finally {
      setMentorLoading(false);
    }
  }

  function resetJourney() {
    stopMusic(); window.localStorage.removeItem(STORAGE_KEY); setPhase("welcome");
    setHouseSolved(false); setHouseInput([]); setHouseStatus("idle");
    setComposition(DEFAULT_COMPOSITION); setMentor(null);
  }

  const activeMentor = mentor ?? (
    phase === "launch" && !mentorLoading
      ? mockMentorFeedback(language, composition)
      : null
  );

  return (
    <main className={`game phase-${phase}`}>
      <div className="aurora" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={() => go("welcome")} aria-label="Resonance home"><span className="brand-mark">R</span><span>RESONANCE</span></button>
        <div className="top-actions">
          <div className="language-switch" aria-label="Language">
            {(["en", "es"] as const).map((lang) => <button key={lang} className={language === lang ? "active" : ""} onClick={() => changeLanguage(lang)}>{lang.toUpperCase()}</button>)}
          </div>
          <button className="round-button" onClick={() => void toggleMute()} aria-label={muted ? t.soundOff : t.soundOn}>{muted ? "♩" : "♫"}</button>
        </div>
      </header>

      {phase === "welcome" && <section className="scene welcome-scene">
        <div className="hero-copy"><span className="eyebrow">{t.dayOne}</span><h1><span>THE LIVING</span>SONG</h1><p>{t.tagline}</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => go(houseSolved ? "atlas" : "house")}>{houseSolved ? t.continue : t.enter} <span>→</span></button>{houseSolved && <button className="text-button" onClick={resetJourney}>{t.newJourney}</button>}</div>
        </div>
        <div className="world-orb" aria-hidden="true"><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="floating-island"><span className="island-tree">♧</span><span className="island-house">⌂</span></div><span className="note note-one">♪</span><span className="note note-two">♫</span><span className="note note-three">♩</span></div>
        <div className="element-rail"><span>01 AIR</span><span>02 WATER</span><span>03 FIRE</span><span>04 EARTH</span></div>
      </section>}

      {phase === "house" && <section className="scene house-scene">
        <div className="scene-heading"><span className="eyebrow">01 · EAR TRAINING</span><h2>{t.houseTitle}</h2><p>{t.houseStory}</p><button className="secondary-button" onClick={() => void playHousePattern()}>♫ {t.listen}</button></div>
        <div className="house-room"><div className="window-moon"><span>☾</span></div>
          <button className="sound-object clock" onClick={() => void selectHouseObject("clock")}><span>◷</span><small>{language === "es" ? "RELOJ" : "CLOCK"}</small></button>
          <button className="sound-object sofa" onClick={() => void selectHouseObject("sofa")}><span>▰</span><small>{language === "es" ? "SOFÁ" : "SOFA"}</small></button>
          <button className="sound-object trunk" onClick={() => void selectHouseObject("trunk")}><span>▣</span><small>{language === "es" ? "BAÚL" : "TRUNK"}</small></button><div className="house-plant">♧</div>
        </div>
        <div className={`challenge-status ${houseStatus}`} role="status"><div className="note-progress">{HOUSE_SEQUENCE.map((item, index) => <span key={item} className={houseInput.length > index ? "found" : ""}>{index + 1}</span>)}</div><p>{houseStatus === "wrong" ? t.wrong : houseStatus === "solved" ? t.solved : t.houseHint}</p>{houseStatus === "solved" && <button className="primary-button" onClick={() => go("atlas")}>{t.openAtlas} →</button>}</div>
      </section>}

      {phase === "atlas" && <section className="scene atlas-scene">
        <div className="scene-heading centered"><span className="eyebrow">THE ECOSOPHIC JOURNEY</span><h2>{t.atlasTitle}</h2><p>{t.atlasStory}</p></div>
        <div className="portal-grid">
          <button className="portal portal-air" onClick={() => go("composition")}><span className="portal-index">01</span><span className="portal-symbol">⌁</span><strong>{t.air}</strong><small>{t.activePortal} →</small></button>
          <div className="portal portal-water disabled"><span className="portal-index">02</span><span className="portal-symbol">≈</span><strong>{t.water}</strong><small>{t.soon}</small></div>
          <div className="portal portal-fire disabled"><span className="portal-index">03</span><span className="portal-symbol">△</span><strong>{t.fire}</strong><small>{t.soon}</small></div>
          <div className="portal portal-earth disabled"><span className="portal-index">04</span><span className="portal-symbol">◇</span><strong>{t.earth}</strong><small>{t.soon}</small></div>
        </div>
      </section>}

      {phase === "composition" && <section className="scene composition-scene">
        <div className="composition-visual"><div className={`sun tempo-${composition.tempo}`}/><div className="mountains"/><div className={`path contour-${composition.contour}`}><span className={playingVersion === "original" ? "dog moving" : "dog"}>♙</span></div><div className="field-notes">♪　♩　♫　♪</div></div>
        <div className="composer-panel"><span className="eyebrow">AIR WORLD · COMPOSITION</span><h2>{t.composeTitle}</h2><p>{t.composeStory}</p>
          <fieldset><legend>{t.tempo}</legend><div className="option-row">{([72,96,120] as const).map((tempo) => <button key={tempo} className={composition.tempo === tempo ? "selected" : ""} onClick={() => updateComposition({...composition, tempo})}><strong>{tempo}</strong><small>{tempo === 72 ? t.walk : tempo === 96 ? t.trot : t.run}</small></button>)}</div></fieldset>
          <fieldset><legend>{t.contour}</legend><div className="option-row contours">{(["rising","falling","wave"] as const).map((contour) => <button key={contour} className={composition.contour === contour ? "selected" : ""} onClick={() => updateComposition({...composition, contour})}><span>{contour === "rising" ? "╱" : contour === "falling" ? "╲" : "∿"}</span><small>{t[contour]}</small></button>)}</div></fieldset>
          <fieldset><legend>{t.instruments}</legend><div className="instrument-row">{(["pluck","flute","bass","percussion"] as const).map((instrument) => <button key={instrument} className={composition.instruments.includes(instrument) ? "selected" : ""} onClick={() => toggleInstrument(instrument)}><span>{instrumentIcons[instrument]}</span><small>{t[instrument]}</small></button>)}</div></fieldset>
          <div className="composer-actions"><button className="secondary-button" onClick={() => void togglePreview("original", composition)}>{playingVersion === "original" ? `■ ${t.stop}` : `▶ ${t.preview}`}</button><button className="primary-button" onClick={() => void awakenWorld()}>{t.commit} →</button></div>
        </div>
      </section>}

      {phase === "launch" && <section className="scene launch-scene">
        <div className="portal-awake" aria-hidden="true"><div className="portal-core">♪</div><span className="bird b1">⌁</span><span className="bird b2">⌁</span></div>
        <div className="launch-copy"><span className="eyebrow">MISSION COMPLETE · AIR RESTORED</span><h2>{t.launchTitle}</h2><p>{t.launchStory}</p>
          {mentorLoading && <article className="mentor-card mentor-loading" role="status"><div className="mentor-avatar">E</div><div><strong>{t.listening}</strong><p>{t.listeningHint}</p><div className="listening-wave" aria-hidden="true"><span/><span/><span/><span/><span/></div></div></article>}
          {activeMentor && <article className="mentor-card"><div className="mentor-avatar">E</div><div className="mentor-content"><div className={`source-badge source-${activeMentor.source}`}>{activeMentor.source === "openai" ? t.openAISource : t.fallbackSource}</div><strong>{t.mentor}</strong><p>{activeMentor.interpretation}</p><p className="concept">{activeMentor.concept}</p><p className="challenge">✦ {activeMentor.variationChallenge}</p><div className="variation-reason"><small>{t.variationReason}</small><p>{activeMentor.suggestedVariation.reason}</p></div></div></article>}
          {activeMentor && <div className="version-controls" role="group" aria-label={language === "es" ? "Comparar versiones" : "Compare versions"}>
            <button className={playingVersion === "original" ? "version-button selected" : "version-button"} aria-pressed={playingVersion === "original"} onClick={() => void togglePreview("original", composition)}><span>01</span><strong>{playingVersion === "original" ? `■ ${t.stop}` : `▶ ${t.mySong}`}</strong><small>{composition.tempo} BPM · {t[composition.contour]}</small></button>
            <button className={playingVersion === "variation" ? "version-button selected" : "version-button"} aria-pressed={playingVersion === "variation"} onClick={() => void togglePreview("variation", activeMentor.suggestedVariation)}><span>02</span><strong>{playingVersion === "variation" ? `■ ${t.stop}` : `▶ ${t.echoVariation}`}</strong><small>{activeMentor.suggestedVariation.tempo} BPM · {t[activeMentor.suggestedVariation.contour]}</small></button>
          </div>}
          <div className="hero-actions"><button className="text-button" onClick={() => go("atlas")}>{t.returnAtlas}</button></div>
        </div>
      </section>}
      <div className="grain" aria-hidden="true"/>
    </main>
  );
}
