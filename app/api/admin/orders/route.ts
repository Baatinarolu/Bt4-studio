import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAllOrders, refundOrder } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || (token as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const orders = await getAllOrders();
  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || (token as any).role !== "ADMIN") {
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
