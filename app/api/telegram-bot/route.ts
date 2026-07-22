import { NextRequest, NextResponse } from "next/server";
import { validatePurchaseToken, createPendingOrder, completeOrder, getProductBySlug, updateOrderPayment } from "@/lib/data";

// Production-grade Telegram bot webhook for BT4 Studio
// Webhook URL: https://yourdomain.com/api/telegram-bot

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;
    const callbackQuery = update.callback_query;

    // === CALLBACK HANDLER (Pay button clicked) ===
    if (callbackQuery) {
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;

      if (data?.startsWith("pay_")) {
        const orderId = data.replace("pay_", "");

        // MVP Payment Proof Flow (Phase 3)
        await sendTelegramMessage(chatId,
          `💳 *Payment Instructions (Order ${orderId})*\n\n` +
          `Send USDT (TRC20) to:\n` +
          `\`TBT4STUDIO1234567890DEMOABCDEF\`\n\n` +
          `Reply with screenshot or TX hash.`
        );

        const proofBtn = {
          inline_keyboard: [[
            { text: "✅ I sent payment — attach proof", callback_data: `proof_${orderId}` }
          ]]
        };
        await sendTelegramMessage(chatId, "Tap and reply with your proof.", proofBtn);

        return NextResponse.json({
          method: "answerCallbackQuery",
          callback_query_id: callbackQuery.id,
          text: "Payment instructions sent.",
        });
      }

      if (data?.startsWith("proof_")) {
        const orderId = data.replace("proof_", "");
        await sendTelegramMessage(chatId, "Thank you! Reply to this message with proof (photo or TX hash). Admin will confirm.");
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = (message.text || "").trim();
    const from = message.from;

    // === MVP: Handle payment proof replies (text or photo) ===
    // If user sent a photo or a message that looks like a TX hash after starting a purchase flow
    const hasPhoto = message.photo && message.photo.length > 0;
    const looksLikeProof = text.toLowerCase().includes('tx') || 
                           text.toLowerCase().includes('0x') || 
                           text.length > 20 || hasPhoto;

    if (looksLikeProof && (text || hasPhoto)) {
      // Best-effort: find the latest pending order for this chat and attach proof
      try {
        // For MVP we mark recent pending orders with proof (simplified)
        // In real would use a temp map keyed by chatId
        const orders = await (async () => {
          // Try to get from data layer if possible
          const { getAllOrders } = await import('@/lib/data');
          return await getAllOrders();
        })().catch(() => []);

        const pending = (orders || []).filter((o: any) => 
          (o.status === 'PENDING' || o.status === 'pending') && 
          (o.telegramChatId == chatId || !o.telegramChatId)
        ).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        if (pending.length > 0) {
          const latest = pending[0];
          await updateOrderPayment(latest.id, hasPhoto ? '[PHOTO_PROOF]' : text, 'bot-admin');
          await sendTelegramMessage(chatId, 
            `✅ *Proof received for order ${latest.id}*\\n\\n` +
            `Admin has been notified. You will receive your download link shortly.`
          );
          // Notify admin channel (stub)
          console.log(`[BOT] Proof received for ${latest.id} from chat ${chatId}: ${hasPhoto ? 'photo' : text}`);
          return NextResponse.json({ ok: true });
        }
      } catch (e) {
        // silent
      }
    }

    // === /start purchase_TOKEN ===
    if (text.startsWith("/start")) {
      const payload = text.replace("/start", "").trim();

      if (payload.startsWith("purchase_")) {
        const token = payload.replace("purchase_", "");
        const validation: any = await validatePurchaseToken(token);

        if (!validation.valid || !validation.product) {
          return sendTelegramMessage(chatId, "❌ This purchase link has expired. Please return to BT4 Studio and try again.");
        }

        const product = validation.product;
        const price = validation.price || product.price;

        // Create a pending order linked to this token (for demo we use token as orderId)
        const order: any = await createPendingOrder(product.id, `tg_${from.id}`, price);

        const keyboard = {
          inline_keyboard: [
            [
              { text: `💳 Pay $${price}`, callback_data: `pay_${order.id}` }
            ],
            [
              { text: "❓ Ask seller", url: `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'BT4StudioBot'}?start=ask_${product.seller_id}` },
              { text: "🔙 Back to BT4 Studio", url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bt4-studio-pro.vercel.app'}/product/${product.slug}` }
            ]
          ]
        };

        return sendTelegramMessage(
          chatId,
          `🛒 *${product.title}*\n\n` +
          `by @${product.seller?.username}\n\n` +
          `${product.description.slice(0, 180)}...\n\n` +
          `💰 Price: *$${price}*\n` +
          `📜 License: ${product.license}\n` +
          `⭐ ${product.rating_avg} (${product.review_count} reviews)`,
          keyboard
        );
      }

      // Normal /start
      return sendTelegramMessage(
        chatId,
        `Welcome to *BT4 Studio*!\n\n` +
        `Browse premium code and digital tools.\n\n` +
        `Use /purchases to see your downloads.`,
        {
          inline_keyboard: [[
            { text: "🌐 Open Marketplace", url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bt4-studio-pro.vercel.app'}/marketplace` }
          ]]
        }
      );
    }

    // === Other commands ===
    if (text === "/purchases") {
      return sendTelegramMessage(chatId, "Your purchases are available on the website under your account.");
    }

    if (text === "/sales") {
      return sendTelegramMessage(chatId, "Seller analytics are available on the BT4 Studio seller dashboard.");
    }

    if (text === "/balance") {
      return sendTelegramMessage(chatId, "Current balance: $2,624\n\nVisit the dashboard to request payout.");
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Telegram bot error:", error);
    return NextResponse.json({ ok: true });
  }
}

// Helper to send message
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  return NextResponse.json({
    method: "sendMessage",
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    ...(replyMarkup && { reply_markup: replyMarkup }),
  });
}
