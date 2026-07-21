import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllOrders, refundOrder } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: token } } = await supabase.auth.getUser();
  if (!token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch role from users table (Supabase native)
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', token.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const orders = await getAllOrders();
  return NextResponse.json(orders);
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
  if (action === "confirm") {
    if (prisma) {
      await prisma.order.update({
        where: { id },
        data: {
          status: "COMPLETED",
          paymentConfirmedBy: (token as any).id || "admin",
        },
      });
    } else {
      // Fallback via data layer (mock or real)
      const { updateOrderPayment, completeOrder } = await import("@/lib/data");
      await updateOrderPayment(id, undefined, (token as any).id || "admin");
      await completeOrder(id);
    }
    return NextResponse.json({ success: true });
  }
  if (action === "refund") {
    await refundOrder(id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid" }, { status: 400 });
}
