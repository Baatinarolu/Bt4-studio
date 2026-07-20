/**
 * BT4 Studio - Complete Unified Data Access Layer
 * 
 * Tries real Prisma (when DATABASE_URL is set and client generated).
 * Falls back gracefully to the excellent in-memory mock in lib/db.ts.
 * 
 * All pages should import from here going forward.
 */

import * as mock from './db';
import { prisma } from './prisma';
import type { Product, Order } from './types';

// ============================================
// PRODUCTS
// ============================================

export async function getAllApprovedProducts(): Promise<Product[]> {
  if (!prisma) return mock.getAllApprovedProducts();
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: 'APPROVED' },
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
    });
    return dbProducts as any;
  } catch {
    return mock.getAllApprovedProducts();
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!prisma) return mock.getProductBySlug(slug);
  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: { seller: true },
    });
    return p as any || undefined;
  } catch {
    return mock.getProductBySlug(slug);
  }
}

// ============================================
// PURCHASE FLOW
// ============================================

export async function createPurchaseToken(productId: string, price: number): Promise<string> {
  if (!prisma) return mock.createPurchaseToken(productId, price);
  try {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.$executeRaw`
      INSERT INTO "PurchaseToken" (id, "productId", price, "expiresAt", used, "createdAt")
      VALUES (${token}, ${productId}, ${price}, ${expiresAt}, false, NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    return token;
  } catch {
    return mock.createPurchaseToken(productId, price);
  }
}

export async function validatePurchaseToken(token: string) {
  if (!prisma) return mock.validatePurchaseToken(token);
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM "PurchaseToken" 
      WHERE id = ${token} AND used = false AND "expiresAt" > NOW()
    `;
    if (!rows.length) return { valid: false };
    const product = await getProductBySlug(rows[0].productId);
    return { valid: true, product, price: rows[0].price };
  } catch {
    return mock.validatePurchaseToken(token);
  }
}

export async function createPendingOrder(productId: string, buyerId: string, amount: number) {
  if (!prisma) return mock.createPendingOrder(productId, buyerId, amount);
  try {
    const product = await getProductBySlug(productId);
    if (!product) throw new Error('Product not found');

    const order = await prisma.order.create({
      data: {
        buyerId,
        productId,
        amount,
        platformFee: amount * 0.2,
        sellerEarnings: amount * 0.8,
        status: 'PENDING',
        downloadToken: crypto.randomUUID(),
        downloadExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: { product: { include: { seller: true } } },
    });
    return order;
  } catch {
    return mock.createPendingOrder(productId, buyerId, amount);
  }
}

export async function completeOrder(orderId: string) {
  if (!prisma) return mock.completeOrder(orderId);
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
      include: { product: { include: { seller: true } } },
    });
    await prisma.product.update({
      where: { id: order.productId },
      data: { salesCount: { increment: 1 } },
    });
    return order;
  } catch {
    return mock.completeOrder(orderId);
  }
}

export async function getUserOrders(userId: string) {
  if (!prisma) return mock.getUserOrders(userId);
  try {
    const dbOrders = await prisma.order.findMany({
      where: { buyerId: userId, status: 'COMPLETED' },
      include: { product: { include: { seller: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return dbOrders;
  } catch {
    return mock.getUserOrders(userId);
  }
}

// ============================================
// SELLER PRODUCT CREATION (PERSIST)
// ============================================

export async function createProduct(data: any) {
  if (!prisma) {
    // Fallback to mock
    const newProduct: any = {
      id: 'p' + Date.now(),
      ...data,
      status: 'PENDING',
      sales_count: 0,
      rating_avg: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
    };
    (mock as any).products = (mock as any).products || [];
    (mock as any).products.push(newProduct);
    return newProduct;
  }

  return prisma.product.create({
    data: {
      ...data,
      status: 'PENDING',
    },
  });
}

// ============================================
// ADMIN
// ============================================

export async function getPendingProducts() {
  if (!prisma) {
    return (mock as any).products.filter((p: any) => p.status === "pending" || p.status === "PENDING");
  }
  return prisma.product.findMany({
    where: { status: 'PENDING' },
    include: { seller: true },
  });
}

export async function approveProduct(productId: string) {
  if (!prisma) {
    const p = (mock as any).products.find((x: any) => x.id === productId);
    if (p) p.status = 'approved';
    return true;
  }
  await prisma.product.update({
    where: { id: productId },
    data: { status: 'APPROVED' },
  });
  return true;
}

export async function rejectProduct(productId: string) {
  if (!prisma) {
    const p = (mock as any).products.find((x: any) => x.id === productId);
    if (p) p.status = 'rejected';
    return true;
  }
  await prisma.product.update({
    where: { id: productId },
    data: { status: 'REJECTED' },
  });
  return true;
}

// Re-export some mock helpers for pages still in transition
export { getProductBySlug as getProductBySlugMock } from './db';

// ============================================
// REVIEWS
// ============================================

export async function getProductReviews(productId: string) {
  if (!prisma) {
    return (mock as any).reviews?.filter((r: any) => r.product_id === productId || r.productId === productId) || [];
  }
  try {
    return await prisma.review.findMany({
      where: { productId },
      include: { buyer: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return (mock as any).reviews?.filter((r: any) => r.product_id === productId || r.productId === productId) || [];
  }
}

export async function createReview(data: {
  productId: string;
  buyerId: string;
  rating: number;
  comment?: string;
}) {
  if (!prisma) {
    const newReview: any = {
      id: 'r' + Date.now(),
      productId: data.productId,
      buyerId: data.buyerId,
      rating: data.rating,
      comment: data.comment || '',
      createdAt: new Date().toISOString(),
    };
    (mock as any).reviews = (mock as any).reviews || [];
    (mock as any).reviews.push(newReview);
    // Update product rating in mock (simple avg)
    const prods = (mock as any).products || [];
    const prod = prods.find((p: any) => p.id === data.productId);
    if (prod) {
      const existing = (mock as any).reviews.filter((r: any) => r.productId === data.productId);
      const avg = existing.reduce((s: number, r: any) => s + r.rating, 0) / Math.max(1, existing.length);
      prod.rating_avg = Math.round(avg * 10) / 10;
      prod.review_count = existing.length;
    }
    return newReview;
  }

  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      buyerId: data.buyerId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  // Update product rating aggregates (simplified)
  try {
    const reviews = await prisma.review.findMany({ where: { productId: data.productId } });
    const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: reviews.length,
      },
    });
  } catch {}

  return review;
}

// Helper to check if user has purchased a product (for verified reviews)
export async function hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  if (!prisma) {
    const userOrders = (mock as any).orders || [];
    return userOrders.some((o: any) => 
      (o.buyer_id === userId || o.buyerId === userId) && 
      (o.product_id === productId || o.productId === productId) && 
      o.status === 'completed'
    );
  }
  try {
    const count = await prisma.order.count({
      where: {
        buyerId: userId,
        productId,
        status: 'COMPLETED',
      },
    });
    return count > 0;
  } catch {
    return false;
  }
}
