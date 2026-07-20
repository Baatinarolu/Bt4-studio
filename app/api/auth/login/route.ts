import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as mock from "@/lib/db";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    let user: any = null;
    if (prisma) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else {
      user = (mock as any).users?.find((u: any) => u.email === email.toLowerCase());
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const jwt = sign({ id: user.id, email: user.email, role: user.role, username: user.username }, process.env.NEXTAUTH_SECRET || "bt4-studio-dev-secret", { expiresIn: "7d" });

    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    res.cookies.set("bt4-auth-token", jwt, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7*24*60*60, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
