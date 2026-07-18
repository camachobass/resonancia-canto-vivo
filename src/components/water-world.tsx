"use client";

import { useState } from "react";
import { playWaterChord, playWaterProgression } from "@/lib/audio-engine";
import {
  WATER_CHALLENGE_IDS,
  WATER_CHALLENGES,
  WATER_CHORD_IDS,
  WATER_CHORDS,
  chordQuality,
  createWaterProgress,
  progressionMatches,
  scoreWaterMission,
  waterChallengeUrl,
  waterCopy,
  type ChordQuality,
  type Language,
  type WaterChordId,
  type WaterProgress,
} from "@/lib/game";

type EarFeedback = { correct: boolean; target: ChordQuality } | null;
type HarmonyFeedback = "correct" | "wrong" | null;

interface WaterWorldProps {
  language: Language;
  progress: WaterProgress;
  invited: boolean;
  onProgress: (progress: WaterProgress) => void;
  onExit: () => void;
}

function Octavia({ active = false }: { active?: boolean }) {
  return (
    <div className={active ? "octavia active" : "octavia"} aria-hidden="true">
      <div className="octavia-halo" />
      <div className="octavia-head">
        <span className="octavia-eye left" />
        <span className="octavia-eye right" />
        <span className="octavia-smile" />
      </div>
      <div className="octavia-tentacles">
        {WATER_CHORD_IDS.map((chord, index) => (
          <span key={chord} className={`decorative-tentacle tentacle-${index + 1}`} />
        ))}
      </div>
      <span className="octavia-note">♫</span>
    </div>
  );
}

export function WaterWorld({
  language,
  progress,
  invited,
  onProgress,
  onExit,
}: WaterWorldProps) {
  const t = waterCopy[language];
  const challenge = WATER_CHALLENGES[progress.challengeId];
  const [earFeedback, setEarFeedback] = useState<EarFeedback>(null);
  const [harmonyFeedback, setHarmonyFeedback] = useState<HarmonyFeedback>(null);
  const [shareStatus, setShareStatus] = useState<"shared" | "copied" | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  function beginEarTrial() {
    setEarFeedback(null);
    onProgress({ ...progress, stage: "ear", earRound: 0 });
  }

  function answerEar(choice: ChordQuality) {
    if (earFeedback) return;
    const target = chordQuality(challenge.earChords[progress.earRound]);
    const correct = choice === target;
    const currentStreak = correct ? progress.currentStreak + 1 : 0;
    setEarFeedback({ correct, target });
    onProgress({
      ...progress,
      earCorrect: progress.earCorrect + (correct ? 1 : 0),
      currentStreak,
      bestStreak: Math.max(progress.bestStreak, currentStreak),
    });
  }

  function advanceEarTrial() {
    setEarFeedback(null);
    if (progress.earRound === challenge.earChords.length - 1) {
      onProgress({ ...progress, stage: "harmony", progressionInput: [] });
      return;
    }
    onProgress({ ...progress, earRound: progress.earRound + 1 });
  }

  function selectTentacle(chord: WaterChordId) {
    if (harmonyFeedback || progress.progressionInput.length >= challenge.progression.length) return;
    void playWaterChord(chord);
    onProgress({
      ...progress,
      progressionInput: [...progress.progressionInput, chord],
    });
  }

  function undoTentacle() {
    if (harmonyFeedback) return;
    onProgress({ ...progress, progressionInput: progress.progressionInput.slice(0, -1) });
  }

  function checkProgression() {
    if (progress.progressionInput.length !== challenge.progression.length) return;
    if (progressionMatches(progress.progressionInput, challenge.progression)) {
      setHarmonyFeedback("correct");
      void playWaterProgression(challenge.progression);
      return;
    }
    setHarmonyFeedback("wrong");
    onProgress({ ...progress, progressionAttempts: progress.progressionAttempts + 1 });
  }

  function retryProgression() {
    setHarmonyFeedback(null);
    onProgress({ ...progress, progressionInput: [] });
  }

  function restoreWaterWorld() {
    const stars = scoreWaterMission(progress.earCorrect, progress.progressionAttempts);
    setHarmonyFeedback(null);
    onProgress({
      ...progress,
      stage: "complete",
      bestStars: Math.max(progress.bestStars, stars),
      completedRuns: progress.completedRuns + 1,
    });
  }

  function playAnotherCurrent() {
    const currentIndex = WATER_CHALLENGE_IDS.indexOf(progress.challengeId);
    const nextId = WATER_CHALLENGE_IDS[(currentIndex + 1) % WATER_CHALLENGE_IDS.length];
    setEarFeedback(null);
    setHarmonyFeedback(null);
    setShareStatus(null);
    setShareLink(null);
    onProgress(createWaterProgress(nextId, progress));
  }

  async function shareChallenge() {
    const url = waterChallengeUrl(window.location.href, progress.challengeId, language);
    setShareLink(url);
    try {
      if (navigator.share) {
        await navigator.share({ title: t.shareTitle, text: t.completeStory, url });
        setShareStatus("shared");
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus(null);
    }
  }

  if (progress.stage === "intro") {
    return (
      <section className="scene water-scene water-intro-scene">
        <div className="water-visual intro-water-visual">
          <div className="water-sunbeam" />
          <Octavia active />
          <div className="reef-floor"><span>♧</span><span>♧</span><span>♧</span></div>
          <div className="bubble-trail"><i /><i /><i /><i /></div>
        </div>
        <div className="water-panel water-intro-copy">
          <span className="eyebrow water-eyebrow">{t.worldLabel}</span>
          <h2>{t.introTitle}</h2>
          <p>{t.introStory}</p>
          <div className="challenge-ticket">
            <span>{invited ? t.friendChallenge : t.challenge}</span>
            <strong>{t.challengeNames[progress.challengeId]}</strong>
            <small>3 CHORDS · 6 TENTACLES · 3 PEARLS</small>
          </div>
          <div className="hero-actions">
            <button className="primary-button water-primary" onClick={beginEarTrial}>{t.start} →</button>
            <button className="text-button" onClick={onExit}>{t.exit}</button>
          </div>
        </div>
      </section>
    );
  }

  if (progress.stage === "ear") {
    const targetChord = challenge.earChords[progress.earRound];
    const feedbackText = earFeedback
      ? earFeedback.correct
        ? earFeedback.target === "major" ? t.correctMajor : t.correctMinor
        : earFeedback.target === "major" ? t.wrongMajor : t.wrongMinor
      : null;

    return (
      <section className="scene water-scene water-ear-scene">
        <div className={`water-visual ear-water-visual ${earFeedback?.target ?? "listening"}`}>
          <div className="current-rings"><span /><span /><span /></div>
          <Octavia active={Boolean(earFeedback?.correct)} />
          <div className="ear-round-orbs" aria-label={`${t.round} ${progress.earRound + 1} / 3`}>
            {challenge.earChords.map((chord, index) => (
              <span key={`${chord}-${index}`} className={index <= progress.earRound ? "reached" : ""}>
                {index < progress.earRound ? "✓" : index + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="water-panel ear-panel">
          <div className="water-stage-meta">
            <span className="eyebrow water-eyebrow">{t.earLabel}</span>
            <span>{t.round} {progress.earRound + 1}/3 · {t.streak} {progress.currentStreak}</span>
          </div>
          <h2>{t.earTitle}</h2>
          <p>{t.earStory}</p>
          <button className="listen-chord-button" onClick={() => void playWaterChord(targetChord)}>
            <span className="listen-icon">♫</span>
            <span><strong>{earFeedback ? t.replayChord : t.listenChord}</strong><small>{t.chooseCurrent}</small></span>
          </button>
          <div className="quality-options" role="group" aria-label={t.chooseCurrent}>
            <button className="quality-coral" disabled={Boolean(earFeedback)} onClick={() => answerEar("major")}>
              <span>☀</span><strong>{t.coral}</strong><small>{t.coralHint}</small>
            </button>
            <button className="quality-depth" disabled={Boolean(earFeedback)} onClick={() => answerEar("minor")}>
              <span>☾</span><strong>{t.depth}</strong><small>{t.depthHint}</small>
            </button>
          </div>
          {earFeedback && (
            <div className={earFeedback.correct ? "water-feedback correct" : "water-feedback wrong"} role="status">
              <span>{earFeedback.correct ? "✓" : "↺"}</span>
              <p>{feedbackText}</p>
              <button className="primary-button water-primary" onClick={advanceEarTrial}>
                {progress.earRound === 2 ? t.buildCurrent : t.nextChord} →
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (progress.stage === "harmony") {
    return (
      <section className="scene water-scene water-harmony-scene">
        <div className="harmony-octopus-stage">
          <Octavia active={harmonyFeedback === "correct"} />
          <div className="tentacle-keyboard" aria-label={t.harmonyTitle}>
            {WATER_CHORD_IDS.map((chord) => (
              <button
                key={chord}
                className={`tentacle-key quality-${WATER_CHORDS[chord].quality}`}
                disabled={Boolean(harmonyFeedback) || progress.progressionInput.length === 3}
                onClick={() => selectTentacle(chord)}
              >
                <span>{WATER_CHORDS[chord].roman}</span>
                <strong>{chord}</strong>
                <small>{WATER_CHORDS[chord].quality === "major" ? t.coralHint : t.depthHint}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="water-panel harmony-panel">
          <span className="eyebrow water-eyebrow">{t.harmonyLabel}</span>
          <h2>{t.harmonyTitle}</h2>
          <p>{t.harmonyStory}</p>
          <button className="listen-chord-button" onClick={() => void playWaterProgression(challenge.progression)}>
            <span className="listen-icon">≋</span><span><strong>{t.hearProgression}</strong><small>01 · 02 · 03</small></span>
          </button>
          <div className="progression-builder">
            <div className="builder-heading"><span>{t.selectedChords}</span><small>{progress.progressionInput.length}/3</small></div>
            <div className="chord-slots">
              {[0, 1, 2].map((index) => {
                const chord = progress.progressionInput[index];
                return <span key={index} className={chord ? "filled" : ""}>{chord ?? t.emptySlot}</span>;
              })}
            </div>
            <div className="builder-tools">
              <button onClick={undoTentacle} disabled={!progress.progressionInput.length || Boolean(harmonyFeedback)}>↶ {t.undo}</button>
              <button onClick={() => onProgress({ ...progress, progressionInput: [] })} disabled={!progress.progressionInput.length || Boolean(harmonyFeedback)}>× {t.clear}</button>
            </div>
          </div>
          {!harmonyFeedback && (
            <button className="primary-button water-primary wide" disabled={progress.progressionInput.length !== 3} onClick={checkProgression}>{t.check} →</button>
          )}
          {harmonyFeedback && (
            <div className={`water-feedback ${harmonyFeedback}`} role="status">
              <span>{harmonyFeedback === "correct" ? "✓" : "↺"}</span>
              <p>{harmonyFeedback === "correct" ? t.harmonyCorrect : t.harmonyWrong}</p>
              <button className="primary-button water-primary" onClick={harmonyFeedback === "correct" ? restoreWaterWorld : retryProgression}>
                {harmonyFeedback === "correct" ? t.completeTitle : t.tryAgain} →
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  const stars = scoreWaterMission(progress.earCorrect, progress.progressionAttempts);
  const pearlLabels = [t.harmonyPearl, t.earPearl, t.firstTryPearl];
  const earnedPearls = [true, progress.earCorrect >= 2, progress.progressionAttempts === 0];

  return (
    <section className="scene water-scene water-complete-scene">
      <div className="restored-reef" aria-hidden="true">
        <div className="reef-moon" />
        <Octavia active />
        <div className="coral-garden"><span>♧</span><span>♨</span><span>♧</span><span>♨</span></div>
        <div className="music-current">♪　♫　♩</div>
      </div>
      <div className="water-panel complete-panel">
        <span className="eyebrow water-eyebrow">{t.completeLabel}</span>
        <h2>{t.completeTitle}</h2>
        <p>{t.completeStory}</p>
        <div className="pearl-score">
          <div className="pearl-summary"><span>{t.pearls}</span><strong>{stars}/3</strong><small>{t.best}: {progress.bestStars}/3</small></div>
          <div className="pearl-list">
            {pearlLabels.map((label, index) => (
              <div key={label} className={earnedPearls[index] ? "earned" : ""}>
                <span>{earnedPearls[index] ? "●" : "○"}</span><p>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="complete-actions">
          <button className="primary-button water-primary" onClick={() => void shareChallenge()}>↗ {t.share}</button>
          <button className="secondary-button" onClick={playAnotherCurrent}>↻ {t.replay}</button>
          <button className="text-button" onClick={onExit}>{t.atlas}</button>
        </div>
        {(shareStatus || shareLink) && (
          <div className="share-result" role="status">
            <strong>{shareStatus === "copied" ? t.copied : shareStatus === "shared" ? t.shared : t.challenge}</strong>
            {shareLink && <input value={shareLink} readOnly onFocus={(event) => event.currentTarget.select()} aria-label={t.challenge} />}
          </div>
        )}
      </div>
    </section>
  );
}
