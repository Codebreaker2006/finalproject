import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  return NextResponse.json({
    user: { email: session.email },
    hasProfile: Boolean(profile),
  });
}
