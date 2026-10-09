"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import AggregatedOutputChart from "@/components/AggregatedOutputChart";
import FiredRulesTable from "@/components/FiredRulesTable";
import FuzzificationPanel from "@/components/FuzzificationPanel";
import InputSlider from "@/components/InputSlider";
import MembershipFunctionsSection from "@/components/MembershipFunctionsSection";
import RiskResult from "@/components/RiskResult";
import { floodRisk, rainfall, riverLevel } from "@/lib/flood-config";
import { clamp, fuzzify, inferFloodRisk } from "@/lib/fuzzy";

const VARIABLES = [rainfall, riverLevel, floodRisk];

export default function Home() {
  const [rainfallValue, setRainfallValue] = useState(0);
  const [riverLevelValue, setRiverLevelValue] = useState(10);

  const result = useMemo(
    () => inferFloodRisk(rainfallValue, riverLevelValue),
    [rainfallValue, riverLevelValue],
  );
  const rainfallDegrees = useMemo(() => fuzzify(rainfallValue, rainfall), [rainfallValue]);
  const riverLevelDegrees = useMemo(() => fuzzify(riverLevelValue, riverLevel), [riverLevelValue]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-8">
      <header className="flex items-center gap-4">
        <Image
          src="/header-mascot.png"
          alt="Mami, the friendly flood-risk mascot"
          width={1122}
          height={1402}
          priority
          sizes="64px"
          className="h-16 w-auto shrink-0"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Mami</h1>
          <p className="text-sm text-muted">Stay a step ahead of the flood.</p>
        </div>
      </header>

      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-sm font-semibold">Inputs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <InputSlider
            label="Rainfall Intensity"
            unit="mm/hr"
            value={rainfallValue}
            min={rainfall.universe.min}
            max={rainfall.universe.max}
            step={rainfall.universe.step}
            onChange={(value) => setRainfallValue(clamp(value, rainfall.universe))}
          />
          <InputSlider
            label="River Level"
            unit="m"
            value={riverLevelValue}
            min={riverLevel.universe.min}
            max={riverLevel.universe.max}
            step={riverLevel.universe.step}
            onChange={(value) => setRiverLevelValue(clamp(value, riverLevel.universe))}
          />
        </div>
      </section>

      <RiskResult result={result} />

      <details className="rounded-lg border border-line bg-card p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          See how this was decided
        </summary>
        <p className="mt-2 text-xs text-muted">
          The fuzzy logic behind the advisory — for the curious.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <FuzzificationPanel
            rainfallDegrees={rainfallDegrees}
            riverLevelDegrees={riverLevelDegrees}
          />
          <FiredRulesTable firedRules={result.firedRules} />
          <AggregatedOutputChart aggregated={result.aggregated} centroid={result.risk} />
          <MembershipFunctionsSection variables={VARIABLES} />
        </div>
      </details>
    </div>
  );
}
