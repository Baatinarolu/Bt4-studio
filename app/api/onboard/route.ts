import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simple in-memory role store for demo (in real app use DB)
const userRoles = new Map<string, string>();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  if (!role || !["BUYER", "SELLER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Save role (in production: prisma.user.update or trigger)
  userRoles.set(user.email, role);

  // Optionally sync to public.users table
  try {
    await supabase.from('users').update({ role }).eq('id', user.id);
  } catch {}

  return NextResponse.json({ success: true, role });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) return NextResponse.json({ role: null });

  let role = userRoles.get(user.email) || "BUYER";
  
  // Try DB for real role
  try {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role) role = profile.role;
  } catch {}

  return NextResponse.json({ role });
}
