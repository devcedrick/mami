"use client";

import { useState } from "react";

interface InputSliderProps {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export default function InputSlider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: InputSliderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(value);

  const handleNumber = (raw: string) => {
    setDraft(raw);
    const parsed = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  const handleRange = (raw: string) => {
    setDraft(null);
    onChange(Number(raw));
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`${label}-number`}
        className="flex items-baseline justify-between text-sm font-medium"
      >
        <span>
          {label}
          {unit ? <span className="text-muted"> ({unit})</span> : null}
        </span>
        <span className="tabular-nums text-muted">{value}</span>
      </label>
      <input
        type="range"
        aria-label={`${label} slider`}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => handleRange(event.target.value)}
        className="w-full accent-foreground"
      />
      <input
        id={`${label}-number`}
        type="number"
        inputMode="decimal"
        value={shown}
        min={min}
        max={max}
        step={step}
        onChange={(event) => handleNumber(event.target.value)}
        onBlur={() => setDraft(null)}
        className="w-full rounded-md border border-line bg-card px-2 py-1 text-sm tabular-nums"
      />
    </div>
  );
}
