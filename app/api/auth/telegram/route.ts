import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as mock from "@/lib/db";
import { sign } from "jsonwebtoken";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, first_name, username, photo_url, auth_date, hash } = body;

    if (!id || !hash) {
      return NextResponse.json({ error: "Invalid Telegram data" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || "demo-bot-token";

    const dataCheckString = Object.keys(body).filter(key => key !== "hash").sort().map(key => `${key}=${body[key]}`).join("\n");
    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (hmac !== hash && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid Telegram signature" }, { status: 401 });
    }

    let user: any = null;
    if (prisma) {
      user = await prisma.user.findUnique({ where: { telegramId: String(id) } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: String(id),
            telegramUsername: username,
            displayName: first_name || username,
            username: (username || `tg${id}`).toLowerCase(),
            avatar: photo_url,
            email: username ? `${username}@tg.bt4.studio` : `tg${id}@bt4.studio`,
            role: "BUYER",
            isSellerApproved: false,
          },
        });
      }
    } else {
      user = (mock as any).users?.find((u: any) => u.telegram_id === String(id));
      if (!user) {
        user = {
          id: "u" + Date.now(),
          email: username ? `${username}@tg.bt4.studio` : `tg${id}@bt4.studio`,
          username: (username || `tg${id}`).toLowerCase(),
          displayName: first_name || username,
          avatar: photo_url,
          role: "BUYER",
          telegram_id: String(id),
          created_at: new Date().toISOString(),
        };
        if (!(mock as any).users) (mock as any).users = [];
        (mock as any).users.push(user);
      }
    }

    const jwt = sign({ id: user.id, email: user.email, role: user.role, telegramId: user.telegramId || user.telegram_id }, process.env.NEXTAUTH_SECRET || "bt4-studio-dev-secret", { expiresIn: "7d" });

    const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar, role: user.role } });
    res.cookies.set("bt4-auth-token", jwt, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/" });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Telegram authentication failed" }, { status: 500 });
  }
}
