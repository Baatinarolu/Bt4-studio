import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllOrders, refundOrder } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { deliverProductToBuyer } from "@/lib/telegram";

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
    // 1. Mark order completed
    let order: any = null;
    if (prisma) {
      order = await prisma.order.update({
        where: { id },
        data: {
          status: "COMPLETED",
          paymentConfirmedBy: (token as any).id || "admin",
        },
        include: { product: true },
      });
    } else {
      const { updateOrderPayment, completeOrder, getAllOrders } = await import("@/lib/data");
      await updateOrderPayment(id, undefined, (token as any).id || "admin");
      await completeOrder(id);
      const orders = await getAllOrders();
      order = orders.find((o: any) => o.id === id);
    }

    // 2. REAL TELEGRAM DELIVERY (using stored telegramFileId)
    if (order) {
      const telegramFileId = order.product?.telegramFileId || order.telegramFileId;
      const buyerChatId = order.telegramChatId || (order as any).buyer?.telegramId;

      if (telegramFileId && buyerChatId) {
        try {
          const { deliverProductToBuyer } = await import("@/lib/telegram");
          await deliverProductToBuyer(
            buyerChatId,
            telegramFileId,
            order.product?.title || "Your purchase",
            id
          );
          console.log(`[ADMIN] Delivered via Telegram to ${buyerChatId} (file_id: ${telegramFileId})`);
        } catch (e) {
          console.error("[ADMIN] Telegram delivery failed:", e);
        }
      } else {
        console.warn(`[ADMIN] Order ${id} confirmed but missing telegramFileId or buyer chatId`);
      }
    }

    return NextResponse.json({ success: true, delivered: !!(order && order.product?.telegramFileId) });
  }
  if (action === "refund") {
    await refundOrder(id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid" }, { status: 400 });
}
