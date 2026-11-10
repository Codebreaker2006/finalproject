import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardView from "@/components/DashboardView";
import type { ProfileData } from "@/lib/fitness";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) redirect("/survey");

  const profileData: ProfileData = {
    sex: profile.sex as ProfileData["sex"],
    age: profile.age,
    activityLevel: profile.activityLevel as ProfileData["activityLevel"],
    mealType: profile.mealType as ProfileData["mealType"],
    exerciseCategory: profile.exerciseCategory as ProfileData["exerciseCategory"],
    unitSystem: profile.unitSystem as ProfileData["unitSystem"],
    heightUnit: profile.heightUnit as ProfileData["heightUnit"],
    weightUnit: profile.weightUnit as ProfileData["weightUnit"],
    weightKg: profile.weightKg,
    heightM: profile.heightM,
  };

  return <DashboardView email={session.email} profile={profileData} />;
}
