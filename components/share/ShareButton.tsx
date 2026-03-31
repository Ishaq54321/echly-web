"use client";

export function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="primary-btn" onClick={onClick}>
      Share
    </button>
  );
}
