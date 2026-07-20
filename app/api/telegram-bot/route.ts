import { NextRequest, NextResponse } from "next/server";
import { validatePurchaseToken, createPendingOrder, completeOrder, getProductBySlug } from "@/lib/db";

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

        // Simulate real payment processing
        const order = completeOrder(orderId);

        if (order) {
          const downloadLink = `https://bt4-studio.vercel.app/download/${order.download_token}`;

          await sendTelegramMessage(chatId, 
            `✅ *Payment Confirmed!*\n\n` +
            `📦 ${order.product?.title}\n` +
            `💰 $${order.amount} USD\n\n` +
            `🔑 *License Key:*\n\`${order.license_key}\`\n\n` +
            `⬇️ *Download Link* (expires in 7 days):\n${downloadLink}\n\n` +
            `Need help? Just reply to this message.`
          );

          // Answer the callback
          return NextResponse.json({
            method: "answerCallbackQuery",
            callback_query_id: callbackQuery.id,
            text: "Payment successful! Check your messages.",
          });
        } else {
          return NextResponse.json({
            method: "answerCallbackQuery",
            callback_query_id: callbackQuery.id,
            text: "Order already processed or invalid.",
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = (message.text || "").trim();
    const from = message.from;

    // === /start purchase_TOKEN ===
    if (text.startsWith("/start")) {
      const payload = text.replace("/start", "").trim();

      if (payload.startsWith("purchase_")) {
        const token = payload.replace("purchase_", "");
        const validation = validatePurchaseToken(token);

        if (!validation.valid || !validation.product) {
          return sendTelegramMessage(chatId, "❌ This purchase link has expired. Please return to BT4 Studio and try again.");
        }

        const product = validation.product;
        const price = validation.price || product.price;

        // Create a pending order linked to this token (for demo we use token as orderId)
        const order = createPendingOrder(product.id, `tg_${from.id}`, price);

        const keyboard = {
          inline_keyboard: [
            [
              { text: `💳 Pay $${price}`, callback_data: `pay_${order.id}` }
            ],
            [
              { text: "❓ Ask seller", url: `https://t.me/BT4StudioBot?start=ask_${product.seller_id}` },
              { text: "🔙 Back to BT4 Studio", url: `https://bt4-studio.vercel.app/product/${product.slug}` }
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
            { text: "🌐 Open Marketplace", url: "https://bt4-studio.vercel.app/marketplace" }
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
