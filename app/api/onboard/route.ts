import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Simple in-memory role store for demo (in real app use DB)
const userRoles = new Map<string, string>();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  if (!role || !["BUYER", "SELLER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Save role (in production: prisma.user.update)
  userRoles.set(session.user.email, role);

  return NextResponse.json({ success: true, role });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ role: null });

  const role = userRoles.get(session.user.email) || "BUYER";
  return NextResponse.json({ role });
}
