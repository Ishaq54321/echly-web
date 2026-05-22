import { useId } from "react";

export function AnnoteLogo({
  width = 22,
  height = 28,
  variant = "gradient",
}: {
  width?: number;
  height?: number;
  /** "gradient" = brand fills; "white" = solid white (for dark backgrounds). */
  variant?: "gradient" | "white";
}) {
  const idBase = useId();
  const topId = `${idBase}-top`;
  const botId = `${idBase}-bot`;
  const isWhite = variant === "white";
  const topFill = isWhite ? "#FFFFFF" : `url(#${topId})`;
  const botFill = isWhite ? "#FFFFFF" : `url(#${botId})`;
  return (
    <svg
      viewBox="0 0 44 55"
      width={width}
      height={height}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient
          id={topId}
          x1="1.5"
          y1="13.83"
          x2="32.72"
          y2="31.74"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#974B89" />
          <stop offset="1" stopColor="#5148C7" />
        </linearGradient>
        <linearGradient
          id={botId}
          x1="0"
          y1="54.86"
          x2="32.35"
          y2="73.42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#573372" />
          <stop offset="1" stopColor="#FD0C63" />
        </linearGradient>
      </defs>
      <path
        fill={topFill}
        d="M43.0959 11.4316C41.0954 11.3859 36.1417 11.0038 31.2531 7.59108C28.4558 5.62764 26.1671 3.02527 24.5772 0H14.9759V9.25937C14.851 9.45229 14.6914 9.62036 14.5051 9.75501C14.4568 9.74508 14.4077 9.73997 14.3584 9.73978H0V24.8306H15.0908V11.9771C15.4507 11.6814 15.891 11.5001 16.3548 11.4565C19.6775 16.0751 23.1761 18.5533 25.4923 19.8908C33.0986 24.2809 43.0627 25.0798 43.0959 24.9455C43.0779 24.8015 43.0752 20.8834 43.0959 11.4316Z"
      />
      <path
        fill={botFill}
        d="M0 43.4318C2.00058 43.4775 6.95421 43.8596 11.8428 47.2723C14.6401 49.2358 16.9288 51.8382 18.5187 54.8634H28.12V45.604C28.2449 45.4112 28.4045 45.2431 28.5908 45.1084C28.6391 45.1184 28.6882 45.1235 28.7375 45.1236H43.0959V30.0328H28.0051V42.8863C27.6452 43.182 27.2049 43.3634 26.7411 43.4069C23.4184 38.7883 19.9198 36.31 17.6036 34.9726C9.99729 30.5825 0.0332261 29.7836 0.0332261 29.9179C0.0179988 30.0619 0.0207666 33.98 0 43.4318Z"
      />
    </svg>
  );
}
