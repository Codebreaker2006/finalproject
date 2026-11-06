import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ActivityLevel,
  ExerciseCategory,
  HeightUnit,
  MealType,
  Sex,
  UnitSystem,
  WeightUnit,
  lbsToKg,
  inchesToMeters,
} from "@/lib/fitness";

function isIn<T extends string>(value: unknown, enumObj: Record<string, T>): value is T {
  return typeof value === "string" && (Object.values(enumObj) as string[]).includes(value);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const { sex, activityLevel, mealType, exerciseCategory, unitSystem, heightUnit, weightUnit, weight, height } = body;

  if (!isIn(sex, Sex)) return NextResponse.json({ error: "Invalid sex." }, { status: 400 });
  if (!isIn(activityLevel, ActivityLevel))
    return NextResponse.json({ error: "Invalid activity level." }, { status: 400 });
  if (!isIn(mealType, MealType)) return NextResponse.json({ error: "Invalid meal type." }, { status: 400 });
  if (!isIn(exerciseCategory, ExerciseCategory))
    return NextResponse.json({ error: "Invalid exercise category." }, { status: 400 });
  if (!isIn(unitSystem, UnitSystem)) return NextResponse.json({ error: "Invalid unit system." }, { status: 400 });
  if (!isIn(heightUnit, HeightUnit)) return NextResponse.json({ error: "Invalid height unit." }, { status: 400 });
  if (!isIn(weightUnit, WeightUnit)) return NextResponse.json({ error: "Invalid weight unit." }, { status: 400 });

  const weightNum = Number(weight);
  const heightNum = Number(height);
  if (!Number.isFinite(weightNum) || weightNum <= 0)
    return NextResponse.json({ error: "Weight must be a positive number." }, { status: 400 });
  if (!Number.isFinite(heightNum) || heightNum <= 0)
    return NextResponse.json({ error: "Height must be a positive number." }, { status: 400 });

  // Normalize to metric base units for storage, same convention
  // fitness.cpp's main() used before running the calculators.
  const weightKg = weightUnit === WeightUnit.lbs ? lbsToKg(weightNum) : weightNum;
  const heightM = heightUnit === HeightUnit.ftin ? inchesToMeters(heightNum) : heightNum;

  const profile = await prisma.profile.upsert({
    where: { userId: session.userId },
    update: {
      sex,
      activityLevel,
      mealType,
      exerciseCategory,
      unitSystem,
      heightUnit,
      weightUnit,
      weightKg,
      heightM,
    },
    create: {
      userId: session.userId,
      sex,
      activityLevel,
      mealType,
      exerciseCategory,
      unitSystem,
      heightUnit,
      weightUnit,
      weightKg,
      heightM,
    },
  });

  return NextResponse.json({ profile });
}
