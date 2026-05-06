"use client";

import { useExtensionDetection } from "@/components/dashboard/hooks/useExtensionDetection";
import { ObIcon } from "./icons";
import { StepShell, StepFooter } from "./StepShell";

const CHROME_WEB_STORE_URL = "https://chromewebstore.google.com/detail/echly/PLACEHOLDER";

type Props = {
  onContinue: () => void;
  onBack: () => void;
};

export function ExtensionStep({ onContinue, onBack }: Props) {
  const { isInstalled } = useExtensionDetection();

  const openWebStore = () => {
    window.open(CHROME_WEB_STORE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <StepShell
      step={4}
      stage={
        <>
          <div className="ob-browser">
            <div className="ob-browser-bar">
              <div className="ob-bb-dots"><span></span><span></span><span></span></div>
              <div className="ob-bb-url">
                <span style={{ color: "var(--ob-soft)", display: "inline-flex" }}>
                  <ObIcon.Lock size={9} />
                </span>
                app.echly.app/dashboard
              </div>
              <div className="ob-bb-extbtn">E</div>
            </div>
            <div className="ob-browser-page">
              <div className="ob-ph-line s"></div>
              <div className="ob-ph-line m"></div>
              <div className="ob-ph-block"></div>
              <div className="ob-ph-grid">
                <div className="ob-ph-tile"></div>
                <div className="ob-ph-tile"></div>
              </div>
              <div className="ob-capture-box" style={{ top: 70, left: 20, width: 220, height: 90 }}>
                <span className="ob-cb-handle tl"></span>
                <span className="ob-cb-handle tr"></span>
                <span className="ob-cb-handle bl"></span>
                <span className="ob-cb-handle br"></span>
                <span className="ob-cb-label">SELECTING · 220×90</span>
              </div>
              <div className="ob-annot a">CTA misaligned on hover</div>
            </div>
          </div>
          <div className="ob-preview-meta" style={{ marginTop: 18 }}>
            Click → drag → describe. That&apos;s a ticket.
          </div>
        </>
      }
    >
      <span className="ob-eyebrow"><span className="dot"></span>Capture toolbar</span>
      <h1 className="ob-h">Install the Echly <br />Chrome extension.</h1>
      <p className="ob-sub">The extension is how you capture screenshots, record clips, and turn them into tickets — right from any tab.</p>

      <div className={"ob-ext-banner " + (isInstalled ? "installed" : "")}>
        <div className="icn"><ObIcon.Chrome size={20} /></div>
        <div className="lab">
          <div className="t">Echly for Chrome</div>
          <div className="s">v2.1 · Works in any Chromium browser · ~1.4MB</div>
        </div>
        <span className="stat">
          <span className="pulse"></span>
          {isInstalled ? "Installed" : "Not installed"}
        </span>
      </div>

      <div className="ob-step-list" style={{ marginTop: 22 }}>
        <div className={"ob-step-item " + (isInstalled ? "done" : "")}>
          <div className="ob-step-num">{isInstalled ? <ObIcon.Check size={9} /> : "1"}</div>
          <div className="ob-step-text">
            Open the{" "}
            <a onClick={openWebStore} role="link" tabIndex={0}>
              Chrome Web Store listing
            </a>{" "}
            in a new tab.
          </div>
        </div>
        <div className={"ob-step-item " + (isInstalled ? "done" : "")}>
          <div className="ob-step-num">{isInstalled ? <ObIcon.Check size={9} /> : "2"}</div>
          <div className="ob-step-text">
            Click <b>Add to Chrome</b>, then confirm permissions.
          </div>
        </div>
        <div className={"ob-step-item " + (isInstalled ? "done" : "")}>
          <div className="ob-step-num">{isInstalled ? <ObIcon.Check size={9} /> : "3"}</div>
          <div className="ob-step-text">
            Pin the Echly icon — we&apos;ll detect it automatically.
          </div>
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        secondary={
          !isInstalled && (
            <button
              type="button"
              className="ob-btn ob-btn-ghost"
              style={{ padding: "0 12px" }}
              onClick={onContinue}
            >
              I&apos;ve installed it
            </button>
          )
        }
        primary={
          isInstalled ? (
            <button type="button" className="ob-btn ob-btn-primary" onClick={onContinue}>
              Continue
              <ObIcon.Arrow size={13} />
            </button>
          ) : (
            <button type="button" className="ob-btn ob-btn-primary" onClick={openWebStore}>
              <ObIcon.Chrome size={14} />
              Add to Chrome
            </button>
          )
        }
        hint={
          !isInstalled ? (
            <span style={{ color: "var(--ob-muted)" }}>
              On a different device?{" "}
              <a
                onClick={onContinue}
                style={{ color: "var(--ob-brand)", textDecoration: "none", fontWeight: 500, cursor: "pointer" }}
              >
                Continue without installing
              </a>
            </span>
          ) : undefined
        }
      />
    </StepShell>
  );
}
