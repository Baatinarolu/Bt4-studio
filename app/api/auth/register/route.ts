import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as mock from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, displayName, role = "BUYER" } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Email, username and password required" }, { status: 400 });
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must be 8+ chars with uppercase and number" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let existing = null;
    if (prisma) {
      existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    } else {
      existing = (mock as any).users?.find((u: any) => u.email === email || u.username === username);
    }
    if (existing) return NextResponse.json({ error: "Email or username already exists" }, { status: 409 });

    let user;
    if (prisma) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          displayName: displayName || username,
          role: role.toUpperCase() as any,
          passwordHash,
          isSellerApproved: false,
        },
      });
    } else {
      user = { id: "u" + Date.now(), email: email.toLowerCase(), username: username.toLowerCase(), displayName: displayName || username, role: role.toUpperCase(), passwordHash, created_at: new Date().toISOString() };
      if (!(mock as any).users) (mock as any).users = [];
      (mock as any).users.push(user);
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
