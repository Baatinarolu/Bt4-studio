import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, createPurchaseToken, createPendingOrder } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { productSlug, price, buyerId = "demo-buyer" } = await req.json();

    const product = getProductBySlug(productSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const finalPrice = price || product.price;
    const token = createPurchaseToken(product.id, finalPrice);

    // Create a pending order right away (linked to the token for demo)
    const order = createPendingOrder(product.id, buyerId, finalPrice);

    const telegramUrl = `https://t.me/BT4StudioBot?start=purchase_${token}`;

    return NextResponse.json({
      success: true,
      token,
      orderId: order.id,
      telegramUrl,
      product: {
        id: product.id,
        title: product.title,
        price: finalPrice,
      },
      expiresIn: "30 minutes",
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
