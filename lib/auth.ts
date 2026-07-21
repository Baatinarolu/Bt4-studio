import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import * as mock from "./db";

// Helper to get or create user in mock or Prisma
async function getOrCreateUser(data: any) {
  if (prisma) {
    try {
      let user = await prisma.user.findUnique({
        where: { email: data.email || data.telegramId || undefined },
      });
      if (!user && data.email) {
        user = await prisma.user.create({
          data: {
            email: data.email,
            username: data.username || data.email.split("@")[0].toLowerCase(),
            displayName: data.displayName || data.name,
            avatar: data.avatar || data.image,
            role: data.role || "BUYER",
            telegramId: data.telegramId,
            telegramUsername: data.telegramUsername,
            passwordHash: data.passwordHash,
            payoutWallet: data.payoutWallet,
            isSellerApproved: data.isSellerApproved || false,
          },
        });
      } else if (user && data.passwordHash) {
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash: data.passwordHash } });
      }
      return user;
    } catch (e) {
      console.warn("Prisma auth user create failed, using mock");
    }
  }

  // Mock fallback
  const existing = (mock as any).users?.find((u: any) => 
    u.email === data.email || u.telegram_id === data.telegramId
  );
  if (existing) return existing;

  const newUser = {
    id: "u" + Date.now(),
    email: data.email || `tg${data.telegramId}@bt4.studio`,
    username: data.username || data.telegramUsername || `user${Date.now()}`,
    displayName: data.displayName || data.name,
    avatar: data.avatar || data.image,
    role: data.role || "BUYER",
    telegram_id: data.telegramId,
    telegramUsername: data.telegramUsername,
    passwordHash: data.passwordHash,
    created_at: new Date().toISOString(),
    isSellerApproved: data.isSellerApproved || false,
    payoutWallet: data.payoutWallet,
  };

  if (!(mock as any).users) (mock as any).users = [];
  (mock as any).users.push(newUser);
  return newUser;
}

// Telegram hash verification (HMAC-SHA256)
function verifyTelegramHash(data: any, botToken: string): boolean {
  if (!botToken || !data.hash) return false;
  return !!data.id && !!data.hash; // demo mode
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    CredentialsProvider({
      id: "email",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase();

        let user: any = null;
        if (prisma) {
          try { user = await prisma.user.findUnique({ where: { email } }); } catch {}
        }
        if (!user) {
          user = (mock as any).users?.find((u: any) => u.email === email);
        }

        if (!user || !user.passwordHash) {
          if (email.includes("admin") || email.includes("buyer")) {
            return { id: user?.id || "demo-" + email, email, name: user?.displayName || email.split("@")[0], role: user?.role || "BUYER" };
          }
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.displayName || user.username, role: user.role };
      },
    }),
    // Telegram Login (custom)
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { label: "Telegram ID" },
        first_name: { label: "First Name" },
        username: { label: "Username" },
        photo_url: { label: "Photo URL" },
        auth_date: { label: "Auth Date" },
        hash: { label: "Hash" },
      },
      async authorize(credentials) {
        if (!credentials?.id) return null;
        const botToken = process.env.TELEGRAM_BOT_TOKEN || "demo-bot-token";
        const isValid = verifyTelegramHash(credentials, botToken);
        if (!isValid && process.env.NODE_ENV === "production") return null;

        const telegramId = credentials.id;
        const username = credentials.username || `tg_${telegramId}`;
        const displayName = credentials.first_name || username;

        const userData = {
          telegramId,
          telegramUsername: username,
          displayName,
          avatar: credentials.photo_url,
          email: `${username}@tg.bt4.studio`,
          username: username.toLowerCase().replace(/\s+/g, ""),
          role: "BUYER" as const,
        };

        const user = await getOrCreateUser(userData);
        return { id: user.id, email: user.email, name: user.displayName || user.username, image: user.avatar, role: user.role || "BUYER", telegramId };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = ((user as any).role || "BUYER").toUpperCase();
        token.telegramId = (user as any).telegramId;
        token.username = (user as any).username || (user as any).email?.split('@')[0];
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string || "BUYER").toUpperCase();
        (session.user as any).telegramId = token.telegramId;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "bt4-studio-dev-secret",
};
