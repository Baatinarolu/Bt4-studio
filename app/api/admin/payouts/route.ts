import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  return NextResponse.json([
    { id: "p1", sellerId: "u1", amount: 71.2, status: "PENDING", walletAddress: "TE7p...xyz", createdAt: new Date() }
  ]);
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
  const { id, action, txHash } = await req.json();
  return NextResponse.json({ success: true, message: `Payout ${action} (tx: ${txHash || "manual"})` });
}
