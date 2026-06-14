import type { RiskLevel } from "@/lib/store";

export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const color =
    level === "Low" ? "var(--risk-low)" :
    level === "Moderate" ? "var(--risk-moderate)" :
    level === "High" ? "var(--risk-high)" : "var(--risk-severe)";
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative grid h-44 w-44 place-items-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" role="img" aria-label={`Burnout score ${score} out of 100, ${level} risk`}>
        <circle cx="64" cy="64" r="56" fill="none" stroke="var(--color-muted)" strokeWidth="12" />
        <circle
          cx="64" cy="64" r="56" fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-foreground">{score}</span>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color }}>{level}</span>
      </div>
    </div>
  );
}