"use client";

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
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
