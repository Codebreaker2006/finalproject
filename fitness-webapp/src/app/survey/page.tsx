"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Sex,
  ActivityLevel,
  MealType,
  ExerciseCategory,
  UnitSystem,
  HeightUnit,
  WeightUnit,
  ACTIVITY_LABELS,
  MEAL_LABELS,
  EXERCISE_LABELS,
} from "@/lib/fitness";

function Question({
  n,
  total,
  label,
  children,
}: {
  n: number;
  total: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-7 border-b border-line">
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-base text-ink">{label}</label>
        <span className="text-xs text-ink/40 readout">
          {n} / {total}
        </span>
      </div>
      {children}
    </div>
  );
}

function RadioRow<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-2 text-sm border transition-colors ${
            value === opt.value
              ? "bg-glaucous text-chalk border-glaucous"
              : "bg-chalk text-ink border-line hover:border-glaucous/60"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SurveyPage() {
  const router = useRouter();

  const [sex, setSex] = useState<Sex>(Sex.male);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.Metric);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevel.Sedentary);
  const [mealType, setMealType] = useState<MealType>(MealType.breakfast);
  const [exerciseCategory, setExerciseCategory] = useState<ExerciseCategory>(ExerciseCategory.cardio);

  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [heightMetric, setHeightMetric] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMetric = unitSystem === UnitSystem.Metric;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const weightNum = Number(weight);
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setError("Enter a valid weight.");
      return;
    }

    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum <= 0) {
      setError("Enter a valid age.");
      return;
    }

    let heightValue: number;
    if (isMetric) {
      heightValue = Number(heightMetric);
      if (!Number.isFinite(heightValue) || heightValue <= 0) {
        setError("Enter a valid height in meters.");
        return;
      }
    } else {
      const feet = Number(heightFeet || 0);
      const inches = Number(heightInches || 0);
      if (!Number.isFinite(feet) || !Number.isFinite(inches) || feet + inches <= 0) {
        setError("Enter a valid height.");
        return;
      }
      heightValue = feet * 12 + inches;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sex,
          activityLevel,
          mealType,
          exerciseCategory,
          unitSystem,
          heightUnit: isMetric ? HeightUnit.meter : HeightUnit.ftin,
          weightUnit: isMetric ? WeightUnit.kg : WeightUnit.lbs,
          weight: weightNum,
          age: ageNum,
          height: heightValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save your info.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-xl mx-auto">
        <p className="font-display text-xl tracking-tight text-ink">Set up your log</p>
        <p className="mt-1 text-sm text-ink/60">
          A few questions, once. You can update these later from your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <Question n={1} total={8} label="Sex">
            <RadioRow
              value={sex}
              onChange={setSex}
              options={[
                { value: Sex.male, label: "Male" },
                { value: Sex.female, label: "Female" },
              ]}
            />
          </Question>

          <Question n={2} total={8} label="Age">
            <input
              type="number"
              min="1"
              step="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 30"
              className="w-full max-w-xs bg-chalk border border-line px-3 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-glaucous/50 focus:border-glaucous"
            />
          </Question>

          <Question n={3} total={8} label="Unit system">
            <RadioRow
              value={unitSystem}
              onChange={setUnitSystem}
              options={[
                { value: UnitSystem.Metric, label: "Metric (kg, m)" },
                { value: UnitSystem.Imperial, label: "Imperial (lbs, ft/in)" },
              ]}
            />
          </Question>

          <Question n={4} total={8} label={`Weight (${isMetric ? "kg" : "lbs"})`}>
            <input
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={isMetric ? "e.g. 72" : "e.g. 160"}
              className="w-full max-w-xs bg-chalk border border-line px-3 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-glaucous/50 focus:border-glaucous"
            />
          </Question>

          <Question n={5} total={8} label={isMetric ? "Height (meters)" : "Height (feet and inches)"}>
            {isMetric ? (
              <input
                type="number"
                step="0.01"
                min="0"
                value={heightMetric}
                onChange={(e) => setHeightMetric(e.target.value)}
                placeholder="e.g. 1.75"
                className="w-full max-w-xs bg-chalk border border-line px-3 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-glaucous/50 focus:border-glaucous"
              />
            ) : (
              <div className="flex gap-3 max-w-xs">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    placeholder="ft"
                    className="w-full bg-chalk border border-line px-3 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-glaucous/50 focus:border-glaucous"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder="in"
                    className="w-full bg-chalk border border-line px-3 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-glaucous/50 focus:border-glaucous"
                  />
                </div>
              </div>
            )}
          </Question>

          <Question n={6} total={8} label="Activity level">
            <RadioRow
              value={activityLevel}
              onChange={setActivityLevel}
              options={Object.values(ActivityLevel).map((v) => ({ value: v, label: ACTIVITY_LABELS[v] }))}
            />
          </Question>

          <Question n={7} total={8} label="Meal you log most often">
            <RadioRow
              value={mealType}
              onChange={setMealType}
              options={Object.values(MealType).map((v) => ({ value: v, label: MEAL_LABELS[v] }))}
            />
          </Question>

          <Question n={8} total={8} label="Preferred exercise category">
            <RadioRow
              value={exerciseCategory}
              onChange={setExerciseCategory}
              options={Object.values(ExerciseCategory).map((v) => ({ value: v, label: EXERCISE_LABELS[v] }))}
            />
          </Question>

          {error && <p className="mt-5 text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-glaucous text-chalk px-6 py-2.5 font-medium hover:bg-glaucousDark transition-colors disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save and see my dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
