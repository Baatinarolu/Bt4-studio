import { NextRequest, NextResponse } from "next/server";
import { createPurchaseToken, getProductBySlug } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { productSlug, price } = await req.json();

    const product = getProductBySlug(productSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const token = createPurchaseToken(product.id, price || product.price);

    // Simulate Telegram deep link
    const telegramUrl = `https://t.me/BT4 StudioBot?start=purchase_${token}`;

    return NextResponse.json({
      success: true,
      token,
      telegramUrl,
      expiresIn: "30 minutes",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create purchase token" }, { status: 500 });
  }
}
