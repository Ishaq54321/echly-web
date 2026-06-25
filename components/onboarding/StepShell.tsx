"use client";

import type { ReactNode } from "react";
import Image from "next/image";

export function StepHeader({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <header className="ob-head">
      <span className="ob-brand">
        <Image
          src="/annote-logo-full.svg"
          alt="Annote"
          width={118}
          height={28}
          priority
          className="ob-brand-logo"
        />
      </span>
      <div className="ob-stepwrap">
        <div className="ob-progress">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={"seg " + (i < step - 1 ? "done" : i === step - 1 ? "cur" : "")}
            />
          ))}
        </div>
        <span>
          <span className="stepnum">{String(step).padStart(2, "0")}</span>{" "}
          <span style={{ color: "var(--ob-soft)" }}>/ {String(total).padStart(2, "0")}</span>
        </span>
      </div>
    </header>
  );
}

export function StepFooter({
  primary,
  secondary,
  onBack,
  hint,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  onBack?: () => void;
  hint?: ReactNode;
}) {
  return (
    <div className="ob-footer">
      <div className="left">
        {onBack && (
          <button type="button" className="ob-back" onClick={onBack}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M10 3.5L5 8l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        )}
        {secondary}
      </div>
      <div className="right">
        {hint && <span className="ob-kbd-hint">{hint}</span>}
        {primary}
      </div>
    </div>
  );
}

/** Two-column shell. Left = form, right = visual stage. */
export function StepShell({
  step,
  children,
  stage,
}: {
  step: number;
  children: ReactNode;
  stage: ReactNode;
}) {
  return (
    <div className="ob">
      <div className="ob-left">
        <StepHeader step={step} />
        <div className="ob-body">{children}</div>
      </div>
      <div className="ob-right">
        <div className="ob-stage">
          <div className="ob-stage-inner">{stage}</div>
        </div>
      </div>
    </div>
  );
}
