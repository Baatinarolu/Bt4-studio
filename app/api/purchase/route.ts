import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, createPurchaseToken, createPendingOrder } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productSlug, price } = body;

    // Prefer real logged-in user from Supabase session
    let buyerId = body.buyerId || "demo-buyer";

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        buyerId = user.id;
      }
    } catch (e) {
      // fallback to passed buyerId or demo
    }

    const product = await getProductBySlug(productSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const finalPrice = price || (product as any).price;
    const token = await createPurchaseToken((product as any).id, finalPrice);

    // Create pending order with the real user ID
    const order = await createPendingOrder((product as any).id, buyerId, finalPrice);

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'BT4StudioBot';
    const telegramUrl = `https://t.me/${botUsername}?start=purchase_${token}`;

    console.log('[PURCHASE] User:', buyerId, '→ Redirecting to Telegram bot:', botUsername, telegramUrl);

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
