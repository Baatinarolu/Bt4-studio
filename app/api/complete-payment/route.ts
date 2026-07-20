import { NextRequest, NextResponse } from "next/server";
import { completeOrder, orders } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const order = completeOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found or already completed" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        license_key: order.license_key,
        download_url: `/download/${order.download_token}`,
        expires: order.download_expires,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to complete payment" }, { status: 500 });
  }
}
