"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { guideCopy, type Language } from "@/lib/game";

interface FieldGuideProps {
  language: Language;
  objective: string;
  restoredWorlds: number;
  onClose: () => void;
  onFullJourney: () => void;
  onQuickDemo: () => void;
}

export function FieldGuide({
  language,
  objective,
  restoredWorlds,
  onClose,
  onFullJourney,
  onQuickDemo,
}: FieldGuideProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeGuide = useEffectEvent(onClose);
  const t = guideCopy[language];
  const steps = [
    { symbol: "◉", title: t.listen, detail: t.listenDetail },
    { symbol: "✦", title: t.create, detail: t.createDetail },
    { symbol: "≋", title: t.compare, detail: t.compareDetail },
    { symbol: "≈", title: t.restore, detail: t.restoreDetail },
  ];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();

    const handleCancel = (event: Event) => {
      event.preventDefault();
      closeGuide();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="guide-dialog"
      aria-labelledby="guide-title"
      aria-describedby="guide-intro"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="guide-surface">
        <header className="guide-header">
          <div>
            <span className="eyebrow">{t.label}</span>
            <h2 id="guide-title">{t.title}</h2>
            <p id="guide-intro">{t.intro}</p>
          </div>
          <button ref={closeRef} className="guide-close" onClick={onClose} aria-label={t.close}>×</button>
        </header>

        <div className="guide-status">
          <div><span>{t.current}</span><strong>{objective}</strong></div>
          <div className="guide-world-count" aria-label={`${restoredWorlds} / 4`}>
            <strong>{restoredWorlds}/4</strong>
            <span>{language === "es" ? "mundos" : "worlds"}</span>
          </div>
        </div>

        <section className="guide-route" aria-labelledby="guide-route-title">
          <h3 id="guide-route-title">{t.route}</h3>
          <div className="guide-steps">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span className="guide-step-index">0{index + 1}</span>
                <span className="guide-step-symbol" aria-hidden="true">{step.symbol}</span>
                <div><strong>{step.title}</strong><p>{step.detail}</p></div>
              </article>
            ))}
          </div>
        </section>

        <div className="guide-bottom">
          <div className="guide-safety">
            <span aria-hidden="true">◇</span>
            <div><strong>{t.safeTitle}</strong><p>{t.safeDetail}</p></div>
          </div>
          <p className="guide-input-hint">♫ {t.headphones}</p>
          <div className="guide-actions">
            <button className="primary-button" onClick={onFullJourney}>{t.fullJourney} →</button>
            <button className="secondary-button" onClick={onQuickDemo}>{t.quickDemo}</button>
          </div>
          <small className="guide-quick-detail">{t.quickDetail}</small>
        </div>
      </div>
    </dialog>
  );
}
