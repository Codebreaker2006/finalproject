/**
 * Direct TypeScript port of native/fitness.h + native/fitness.cpp.
 *
 * Vercel's serverless functions run JS/TS, not C++, so this file is what
 * actually powers the app's calculations. It mirrors the C++ source
 * field-for-field and formula-for-formula so the two stay in lockstep:
 *   - enums below  <->  enum class Sex / ActivityLevel / MealType / ...
 *   - ProfileData   <->  the private members of class User
 *   - calculateBmiMetric()   <->  BMIcalculatorMetric::calculateBMI()
 *   - calculateBmiImperial() <->  BMIcalculatorImperial::calculateBMI()
 *   - calculateIdealWeightKg() <-> IdealWeightCalculator::calculateIdealWeight()
 *
 * If you change a formula in the C++ file, change it here too.
 */

export enum Sex {
  male = "male",
  female = "female",
}

export enum ActivityLevel {
  Sedentary = "Sedentary",
  light = "light",
  moderate = "moderate",
  active = "active",
  veryactive = "veryactive",
}

export enum MealType {
  breakfast = "breakfast",
  lunch = "lunch",
  dinner = "dinner",
  snack = "snack",
}

export enum ExerciseCategory {
  cardio = "cardio",
  strength = "strength",
  flexibility = "flexibility",
  sports = "sports",
}

export enum UnitSystem {
  Metric = "Metric",
  Imperial = "Imperial",
}

export enum WeightUnit {
  kg = "kg",
  lbs = "lbs",
}

export enum HeightUnit {
  meter = "meter",
  ftin = "ftin",
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  [ActivityLevel.Sedentary]: "Sedentary (little or no exercise)",
  [ActivityLevel.light]: "Light (1-3 days/week)",
  [ActivityLevel.moderate]: "Moderate (3-5 days/week)",
  [ActivityLevel.active]: "Active (6-7 days/week)",
  [ActivityLevel.veryactive]: "Very active (hard exercise daily)",
};

export const EXERCISE_LABELS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.cardio]: "Cardio",
  [ExerciseCategory.strength]: "Strength training",
  [ExerciseCategory.flexibility]: "Flexibility",
  [ExerciseCategory.sports]: "Sports",
};

export const MEAL_LABELS: Record<MealType, string> = {
  [MealType.breakfast]: "Breakfast",
  [MealType.lunch]: "Lunch",
  [MealType.dinner]: "Dinner",
  [MealType.snack]: "Snack",
};

/** Mirrors the private members of the C++ `User` class. Weight/height are
 * always kept in metric base units (kg, meters) — same as fitness.cpp's
 * main(), which converts imperial input to metric before storing/computing. */
export interface ProfileData {
  sex: Sex;
  age: number;
  activityLevel: ActivityLevel;
  mealType: MealType;
  exerciseCategory: ExerciseCategory;
  unitSystem: UnitSystem;
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
  weightKg: number;
  heightM: number;
}

/** Port of BMIcalculatorMetric::calculateBMI() */
export function calculateBmiMetric(weightKg: number, heightM: number): number {
  if (heightM <= 0) {
    throw new Error("Height must be greater than zero.");
  }
  return weightKg / (heightM * heightM);
}

/** Port of BMIcalculatorImperial::calculateBMI() */
export function calculateBmiImperial(weightLbs: number, heightInches: number): number {
  if (heightInches <= 0) {
    throw new Error("Height in inches must be greater than zero.");
  }
  return (weightLbs / (heightInches * heightInches)) * 703.0;
}

/** Port of IdealWeightCalculator::calculateIdealWeight() */
export function calculateIdealWeightKg(heightM: number): number {
  if (heightM <= 0) {
    throw new Error("Height must be greater than zero.");
  }
  const lowBmi = 18.5;
  const highBmi = 24.9;
  const lowWeightKg = lowBmi * heightM * heightM;
  const highWeightKg = highBmi * heightM * heightM;
  return (lowWeightKg + highWeightKg) / 2.0;
}

const KG_PER_LB = 0.45359237;
const M_PER_INCH = 0.0254;

export function kgToLbs(kg: number): number {
  return kg / KG_PER_LB;
}
export function lbsToKg(lbs: number): number {
  return lbs * KG_PER_LB;
}
export function metersToInches(m: number): number {
  return m / M_PER_INCH;
}
export function inchesToMeters(inches: number): number {
  return inches * M_PER_INCH;
}

export interface BmiResult {
  bmi: number;
  category: "Underweight" | "Normal weight" | "Overweight" | "Obese";
}

export function classifyBmi(bmi: number): BmiResult["category"] {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/** Computes BMI for a stored profile, using whichever formula matches the
 * user's preferred unit system — same branch fitness.cpp's main() took. */
export function getBmi(profile: ProfileData): BmiResult {
  let bmi: number;
  if (profile.unitSystem === UnitSystem.Imperial) {
    bmi = calculateBmiImperial(kgToLbs(profile.weightKg), metersToInches(profile.heightM));
  } else {
    bmi = calculateBmiMetric(profile.weightKg, profile.heightM);
  }
  return { bmi, category: classifyBmi(bmi) };
}

/** Calculates BMR using the Mifflin–St Jeor equation. */
export function calculateBmr(sex: Sex, weightKg: number, heightM: number, age: number): number {
  if (weightKg <= 0 || heightM <= 0 || age <= 0) {
    throw new Error("Weight, height, and age must be greater than zero.");
  }

  const base = 10 * weightKg + 6.25 * (heightM * 100) - 5 * age;
  return base + (sex === Sex.male ? 5 : -161);
}

export function getBmr(profile: ProfileData): number {
  return calculateBmr(profile.sex, profile.weightKg, profile.heightM, profile.age);
}

export interface IdealWeightResult {
  idealWeightKg: number;
  idealWeightLbs: number;
}

export function getIdealWeight(profile: ProfileData): IdealWeightResult {
  const idealWeightKg = calculateIdealWeightKg(profile.heightM);
  return { idealWeightKg, idealWeightLbs: kgToLbs(idealWeightKg) };
}
