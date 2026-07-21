import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllUsers } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import * as mock from "@/lib/db";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: token } } = await supabase.auth.getUser();
  if (!token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { data: profile } = await supabase.from('users').select('role').eq('id', token.id).single();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const users = await getAllUsers();
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: token } } = await supabase.auth.getUser();
  if (!token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { data: profile } = await supabase.from('users').select('role').eq('id', token.id).single();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { id, action } = await req.json();
  if (action === "promote-seller") {
    if (prisma) {
      await prisma.user.update({ where: { id }, data: { role: "SELLER", isSellerApproved: true } });
    } else {
      const u = (mock as any).users?.find((x: any) => x.id === id);
      if (u) { u.role = "SELLER"; u.isSellerApproved = true; }
    }
    return NextResponse.json({ success: true });
  }
  if (action === "ban") {
    if (prisma) await prisma.user.update({ where: { id }, data: { role: "BUYER" } });
    return NextResponse.json({ success: true, message: "User banned (demo)" });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
