import { NextRequest, NextResponse } from "next/server";
import { validatePurchaseToken, completePurchase } from "@/lib/db";

// Telegram Bot webhook handler (production-ready stub for Vercel)
// In real deployment: Set webhook to https://yourdomain.com/api/telegram-bot
// Bot username: @CodeVaultBot

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Telegram update format
    const message = body.message || body.edited_message;
    const callbackQuery = body.callback_query;

    if (callbackQuery) {
      // Handle inline button clicks
      const data = callbackQuery.data;
      
      if (data?.startsWith("pay_")) {
        const token = data.replace("pay_", "");
        const validation = validatePurchaseToken(token);
        
        if (validation.valid && validation.product) {
          // In real app: integrate with Telegram Payments API or Stripe
          return NextResponse.json({
            method: "answerCallbackQuery",
            callback_query_id: callbackQuery.id,
            text: "✅ Payment successful! Opening receipt...",
            show_alert: false,
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text || "";
    const from = message.from;

    // Command routing
    if (text.startsWith("/start")) {
      const startPayload = text.replace("/start ", "").trim();
      
      if (startPayload.startsWith("purchase_")) {
        const token = startPayload.replace("purchase_", "");
        const validation = validatePurchaseToken(token);
        
        if (validation.valid && validation.product) {
          // Return inline keyboard for payment
          return NextResponse.json({
            method: "sendMessage",
            chat_id: chatId,
            text: `🛒 Purchase: *${validation.product.title}*\n\nPrice: $${validation.price}\n\nSelect an option:`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { 
                    text: `Pay $${validation.price}`, 
                    callback_data: `pay_${token}` 
                  }
                ],
                [
                  { text: "Ask seller", url: `https://t.me/CodeVaultBot?start=chat_${validation.product.seller_id}` },
                  { text: "Back to marketplace", url: `https://codevault-studio.vercel.app/product/${validation.product.slug}` }
                ]
              ]
            }
          });
        } else {
          return NextResponse.json({
            method: "sendMessage",
            chat_id: chatId,
            text: "❌ Purchase link expired or invalid. Please return to the website and try again.",
          });
        }
      }
      
      // Default welcome
      return NextResponse.json({
        method: "sendMessage",
        chat_id: chatId,
        text: `Welcome to *CodeVault Studio*!\n\nBrowse premium code, SaaS templates, and developer tools.\n\nUse /purchases to see your orders.\nUse /sales if you're a seller.`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "🌐 Open Marketplace", url: "https://codevault-studio.vercel.app/marketplace" }
          ]]
        }
      });
    }

    if (text === "/purchases") {
      return NextResponse.json({
        method: "sendMessage",
        chat_id: chatId,
        text: `Your recent purchases:\n\n• Stripe Connect Dashboard — $89\n• SaaS Starter Kit — $199\n\nUse the links above to re-download or view license keys.`,
      });
    }

    if (text === "/sales") {
      return NextResponse.json({
        method: "sendMessage",
        chat_id: chatId,
        text: `Seller dashboard:\n\nSales this month: 41\nRevenue: $3,280\n\nVisit web dashboard for full analytics.`,
      });
    }

    if (text === "/balance") {
      return NextResponse.json({
        method: "sendMessage",
        chat_id: chatId,
        text: `Current balance: $2,624\n\nAvailable for withdrawal: $2,624\nMinimum payout: $25`,
        reply_markup: {
          inline_keyboard: [[{ text: "Request payout", callback_data: "withdraw" }]]
        }
      });
    }

    // Fallback: product search
    if (text.length > 2) {
      return NextResponse.json({
        method: "sendMessage",
        chat_id: chatId,
        text: `Search results for "${text}"\n\nTry the full marketplace on the web for advanced filters.`,
        reply_markup: {
          inline_keyboard: [[
            { text: "🔍 Open Marketplace", url: `https://codevault-studio.vercel.app/marketplace?search=${encodeURIComponent(text)}` }
          ]]
        }
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Telegram bot error:", error);
    return NextResponse.json({ ok: true });
  }
}
