import type { JSX } from "react";

export interface GameTimerProps {
  readonly deadline: number | null;
  readonly now: number;
  readonly totalDurationSeconds?: number;
  readonly criticalThresholdSeconds?: number;
  readonly size?: "compact" | "regular" | "prominent";
}

export function GameTimer({
  deadline,
  now,
  totalDurationSeconds = 0,
  criticalThresholdSeconds = 5,
  size = "regular"
}: GameTimerProps): JSX.Element {
  const remainingMilliseconds = deadline === null ? null : Math.max(0, deadline - now);
  const remainingSeconds = remainingMilliseconds === null ? null : Math.ceil(remainingMilliseconds / 1000);
  const totalMilliseconds = totalDurationSeconds * 1000;
  const fraction = remainingMilliseconds === null || totalMilliseconds <= 0
    ? 0
    : Math.min(1, Math.max(0, remainingMilliseconds / totalMilliseconds));
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const isCritical = remainingSeconds !== null && remainingSeconds <= criticalThresholdSeconds;
  const isExpired = remainingSeconds === 0;
  const label = remainingSeconds === null ? "SÜRESİZ" : `${String(remainingSeconds).padStart(2, "0")} SN`;

  return (
    <div
      className={`glix-game-timer is-${size} ${isCritical ? "is-critical" : ""} ${isExpired ? "is-expired" : ""}`}
      role="timer"
      aria-label={remainingSeconds === null ? "Süresiz faz" : `Kalan süre ${remainingSeconds} saniye`}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle className="glix-timer-track" cx="26" cy="26" r={radius} />
        <circle
          className="glix-timer-progress"
          cx="26"
          cy="26"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - fraction)
          }}
        />
      </svg>
      <strong>{isExpired ? "00" : remainingSeconds === null ? "—" : String(remainingSeconds).padStart(2, "0")}</strong>
      <span>{label === "SÜRESİZ" ? label : "SN"}</span>
    </div>
  );
}
