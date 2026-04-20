"use client";

export function ShareButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`primary-btn${disabled ? " opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      Share
    </button>
  );
}
