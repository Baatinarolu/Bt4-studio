import { NextRequest, NextResponse } from "next/server";
import { completeOrder } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const order = await completeOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found or already completed" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: (order as any).id,
        license_key: (order as any).license_key,
        download_url: `/download/${(order as any).download_token}`,
        expires: (order as any).download_expires,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to complete payment" }, { status: 500 });
  }
}
