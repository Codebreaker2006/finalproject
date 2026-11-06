"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileData,
  Sex,
  UnitSystem,
  getBmi,
  getIdealWeight,
  kgToLbs,
  metersToInches,
  ACTIVITY_LABELS,
  MEAL_LABELS,
  EXERCISE_LABELS,
} from "@/lib/fitness";

type Tab = "profile" | "bmi" | "ideal";

const BMI_SCALE: { label: string; range: string; active: (bmi: number) => boolean }[] = [
  { label: "Underweight", range: "below 18.5", active: (b) => b < 18.5 },
  { label: "Normal weight", range: "18.5 – 24.9", active: (b) => b >= 18.5 && b < 25 },
  { label: "Overweight", range: "25 – 29.9", active: (b) => b >= 25 && b < 30 },
  { label: "Obese", range: "30 and above", active: (b) => b >= 30 },
];

export default function DashboardView({ email, profile }: { email: string; profile: ProfileData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [signingOut, setSigningOut] = useState(false);

  const isMetric = profile.unitSystem === UnitSystem.Metric;
  const bmi = useMemo(() => getBmi(profile), [profile]);
  const ideal = useMemo(() => getIdealWeight(profile), [profile]);

  const displayWeight = isMetric ? profile.weightKg : kgToLbs(profile.weightKg);
  const displayHeight = isMetric ? profile.heightM : metersToInches(profile.heightM);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between pb-6 border-b border-line">
          <div>
            <p className="font-display text-xl tracking-tight text-ink">Fitness Log</p>
            <p className="text-sm text-ink/50">{email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm text-ink/60 hover:text-clay transition-colors"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </header>

        <nav className="flex gap-1 mt-6 border-b border-line">
          {(
            [
              ["profile", "Profile"],
              ["bmi", "BMI"],
              ["ideal", "Ideal weight"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm -mb-px border-b-2 transition-colors ${
                tab === key
                  ? "border-glaucous text-ink font-medium"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="py-10">
          {tab === "profile" && (
            <div>
              <h2 className="font-display text-lg mb-6">Your stats</h2>
              <dl className="divide-y divide-line border-t border-b border-line">
                <Row label="Sex" value={profile.sex === Sex.male ? "Male" : "Female"} />
                <Row
                  label="Weight"
                  value={`${displayWeight.toFixed(1)} ${isMetric ? "kg" : "lbs"}`}
                />
                <Row
                  label="Height"
                  value={
                    isMetric
                      ? `${displayHeight.toFixed(2)} m`
                      : `${Math.floor(displayHeight / 12)} ft ${Math.round(displayHeight % 12)} in`
                  }
                />
                <Row label="Activity level" value={ACTIVITY_LABELS[profile.activityLevel]} />
                <Row label="Meal logged most often" value={MEAL_LABELS[profile.mealType]} />
                <Row label="Preferred exercise" value={EXERCISE_LABELS[profile.exerciseCategory]} />
                <Row label="Unit system" value={isMetric ? "Metric" : "Imperial"} />
              </dl>
              <a
                href="/survey"
                className="inline-block mt-6 text-sm text-glaucous hover:text-glaucousDark underline underline-offset-2"
              >
                Update my answers
              </a>
            </div>
          )}

          {tab === "bmi" && (
            <div>
              <h2 className="font-display text-lg mb-1">Body mass index</h2>
              <p className="text-sm text-ink/60 mb-8">
                Calculated from the weight and height you entered.
              </p>

              <div className="flex items-baseline gap-3">
                <span className="readout text-6xl text-ink">{bmi.bmi.toFixed(1)}</span>
                <span className="text-base text-glaucous font-medium">{bmi.category}</span>
              </div>

              <div className="mt-8 border-t border-line pt-6 space-y-2">
                {BMI_SCALE.map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between py-2 px-3 text-sm ${
                      row.active(bmi.bmi) ? "bg-glaucous/10 text-ink" : "text-ink/50"
                    }`}
                  >
                    <span>{row.label}</span>
                    <span className="readout">{row.range}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs text-ink/40 max-w-md">
                BMI = weight ÷ height². It's a rough screening measure, not a diagnosis — it doesn't
                account for muscle mass, bone density, or body composition.
              </p>
            </div>
          )}

          {tab === "ideal" && (
            <div>
              <h2 className="font-display text-lg mb-1">Ideal weight</h2>
              <p className="text-sm text-ink/60 mb-8">
                The midpoint of the healthy BMI range (18.5–24.9) for your height.
              </p>

              <div className="flex items-baseline gap-3">
                <span className="readout text-6xl text-ink">
                  {(isMetric ? ideal.idealWeightKg : ideal.idealWeightLbs).toFixed(1)}
                </span>
                <span className="text-base text-ink/60">{isMetric ? "kg" : "lbs"}</span>
              </div>

              <div className="mt-8 border-t border-line pt-6 text-sm text-ink/70 space-y-1">
                <div className="flex justify-between py-1.5">
                  <span>Your current weight</span>
                  <span className="readout">
                    {displayWeight.toFixed(1)} {isMetric ? "kg" : "lbs"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Difference from ideal</span>
                  <span className="readout">
                    {(
                      (isMetric ? profile.weightKg : displayWeight) -
                      (isMetric ? ideal.idealWeightKg : ideal.idealWeightLbs)
                    ).toFixed(1)}{" "}
                    {isMetric ? "kg" : "lbs"}
                  </span>
                </div>
              </div>

              <p className="mt-6 text-xs text-ink/40 max-w-md">
                This is a general estimate based on height alone. It doesn&apos;t account for frame
                size, muscle mass, age, or individual health history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-sm text-ink/60">{label}</dt>
      <dd className="text-sm text-ink font-medium">{value}</dd>
    </div>
  );
}
