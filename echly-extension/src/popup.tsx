/**
 * Popup: login-only. If not authenticated → show Continue with Google.
 * If authenticated → close immediately and toggle widget visibility.
 */
import React from "react";
import { createRoot } from "react-dom/client";

function getAuthState(): Promise<{
  authenticated: boolean;
  user: { uid: string; name: string | null; email: string | null; photoURL: string | null } | null;
}> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_AUTH_STATE" },
      (r: { authenticated?: boolean; user?: { uid: string; name: string | null; email: string | null; photoURL: string | null } | null }) => {
        resolve({
          authenticated: !!r?.authenticated,
          user: r?.user ?? null,
        });
      }
    );
  });
}

function startLogin(): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_START_LOGIN" },
      (r: { success?: boolean; error?: string } | undefined) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        resolve({ success: !!r?.success, error: r?.error });
      }
    );
  });
}

function openWidget(): void {
  chrome.runtime.sendMessage({ type: "ECHLY_OPEN_WIDGET" }).catch(() => {});
}

function GoogleLogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 6.168-2.172l-2.908-2.258c-.806.54-1.837.86-3.26.86-2.513 0-4.662-1.697-5.42-4.02H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.58 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.04l2.625-2.04-.002-.288z" />
      <path fill="#EA4335" d="M9 3.58c1.414 0 2.679.478 3.634 1.418l2.718-2.718C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.96L3.58 7.29C4.338 4.967 6.487 3.58 9 3.58z" />
    </svg>
  );
}

function PopupApp() {
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAuthState().then(({ authenticated: auth }) => {
      setAuthenticated(auth);
      setAuthChecked(true);
      if (auth) {
        openWidget();
        window.close();
      }
    });
  }, []);

  const handleContinueWithGoogle = React.useCallback(() => {
    setLoginError(null);
    setLoginLoading(true);
    startLogin()
      .then(({ success, error }) => {
        setLoginLoading(false);
        if (success) {
          openWidget();
          window.close();
          return;
        }
        setLoginError(error ?? "Sign in failed");
      })
      .catch(() => {
        setLoginLoading(false);
        setLoginError("Sign in failed");
      });
  }, []);

  if (!authChecked) {
    return (
      <div className="echly-popup-loading">
        Loading…
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="echly-popup-closing">
        Closing…
      </div>
    );
  }

  return (
    <div className="echly-popup-login">
      <img
        src={chrome.runtime.getURL("assets/Echly_logo.svg")}
        alt="Echly"
        width={40}
        height={40}
        className="echly-popup-logo"
      />
      <h1 className="echly-popup-title">
        Sign in to Echly
      </h1>
      <p className="echly-popup-subtitle">
        Capture feedback instantly across any website.
      </p>
      {loginError && (
        <p className="echly-popup-error">{loginError}</p>
      )}
      <button
        type="button"
        onClick={handleContinueWithGoogle}
        disabled={loginLoading}
        className="echly-popup-btn"
      >
        <GoogleLogoIcon />
        {loginLoading ? "Signing in…" : "Continue with Google"}
      </button>
      <p className="echly-popup-footer">
        We only use your Google account for authentication.
      </p>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<PopupApp />);
}
