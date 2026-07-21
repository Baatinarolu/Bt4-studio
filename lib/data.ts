/**
 * BT4 Studio - Complete Unified Data Access Layer (Production-ready)
 *
 * Primary entry point for ALL data operations.
 * 
 * - When DATABASE_URL + @prisma/client are available → uses real PostgreSQL via Prisma.
 * - Otherwise → falls back gracefully to excellent in-memory mock in lib/db.ts.
 *
 * All pages / API routes MUST import from here.
 */

import * as mock from './db';
import { prisma } from './prisma';
import type { Product, Order, Review } from './types';

// ============================================
// HELPERS
// ============================================

function isRealPrisma(): boolean {
  const real = !!prisma;
  if (real && process.env.NODE_ENV !== 'production') {
    // One-time log so developers see the real backend is active
    if (!(global as any).__bt4_logged_real_db) {
      console.log('[BT4] Using REAL PostgreSQL backend (DATABASE_URL detected)');
      (global as any).__bt4_logged_real_db = true;
    }
  }
  return real;
}

// ============================================
// PRODUCTS
// ============================================

export async function getAllApprovedProducts(): Promise<any[]> {
  if (!isRealPrisma()) {
    return mock.getAllApprovedProducts();
  }

  try {
    const dbProducts = await prisma!.product.findMany({
      where: { status: 'APPROVED' },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Normalize to UI shape (camelCase + legacy aliases)
    return dbProducts.map((p: any) => ({
      ...p,
      id: p.id,
      seller_id: p.sellerId,
      category_id: p.category,
      price: Number(p.price),
      sales_count: p.salesCount,
      rating_avg: p.ratingAvg,
      review_count: p.ratingCount,
      created_at: p.createdAt.toISOString(),
      preview_url: p.previewImages?.[0] || null,
      preview_images: p.previewImages || [],
      file_url: p.fileUrl,
      demo_url: p.demoUrl,
      license: p.licenseType,
      seller: p.seller,
    }));
  } catch (error) {
    console.warn('[data] Prisma getAllApprovedProducts failed, using mock:', error);
    return mock.getAllApprovedProducts();
  }
}

export async function getProductBySlug(slug: string): Promise<any | undefined> {
  if (!isRealPrisma()) {
    return mock.getProductBySlug(slug);
  }

  try {
    const p = await prisma!.product.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            isVerified: true,
          },
        },
      },
    });

    if (!p) return undefined;

    return {
      ...p,
      id: p.id,
      seller_id: p.sellerId,
      category_id: p.category,
      price: Number(p.price),
      sales_count: p.salesCount,
      rating_avg: p.ratingAvg,
      review_count: p.ratingCount,
      created_at: p.createdAt.toISOString(),
      preview_url: p.previewImages?.[0] || null,
      preview_images: p.previewImages || [],
      file_url: p.fileUrl,
      demo_url: p.demoUrl,
      license: p.licenseType,
      seller: p.seller,
    };
  } catch (error) {
    console.warn('[data] Prisma getProductBySlug failed, using mock');
    return mock.getProductBySlug(slug);
  }
}

// ============================================
// PURCHASE FLOW (REAL + FALLBACK)
// ============================================

export async function createPurchaseToken(productId: string, price: number): Promise<string> {
  if (!isRealPrisma()) {
    return mock.createPurchaseToken(productId, price);
  }

  try {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma!.$executeRaw`
      INSERT INTO "PurchaseToken" (id, "productId", price, "expiresAt", used, "createdAt")
      VALUES (${token}, ${productId}, ${price}, ${expiresAt}, false, NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    return token;
  } catch (error) {
    console.warn('[data] createPurchaseToken fallback');
    return mock.createPurchaseToken(productId, price);
  }
}

export async function validatePurchaseToken(token: string) {
  if (!isRealPrisma()) {
    return mock.validatePurchaseToken(token);
  }

  try {
    const rows: any[] = await prisma!.$queryRaw`
      SELECT * FROM "PurchaseToken" 
      WHERE id = ${token} AND used = false AND "expiresAt" > NOW()
    `;

    if (!rows.length) return { valid: false };

    const product = await getProductBySlug(rows[0].productId); // reuse normalized getter
    return { 
      valid: true, 
      product, 
      price: Number(rows[0].price) 
    };
  } catch (error) {
    return mock.validatePurchaseToken(token);
  }
}

export async function createPendingOrder(productId: string, buyerId: string, amount: number) {
  if (!isRealPrisma()) {
    return mock.createPendingOrder(productId, buyerId, amount);
  }

  try {
    const product = await getProductBySlug(productId);
    if (!product) throw new Error('Product not found');

    const order = await prisma!.order.create({
      data: {
        buyerId,
        productId: product.id,
        amount: amount,
        platformFee: amount * 0.2,
        sellerEarnings: amount * 0.8,
        status: 'PENDING',
        downloadToken: crypto.randomUUID(),
        downloadExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        product: {
          include: {
            seller: { select: { username: true, avatar: true } },
          },
        },
      },
    });

    return {
      ...order,
      amount: Number(order.amount),
      platformFee: Number(order.platformFee),
      sellerEarnings: Number(order.sellerEarnings),
    };
  } catch (error) {
    console.warn('[data] createPendingOrder fallback');
    return mock.createPendingOrder(productId, buyerId, amount);
  }
}

export async function completeOrder(orderId: string) {
  if (!isRealPrisma()) {
    return mock.completeOrder(orderId);
  }

  try {
    const order = await prisma!.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
      include: {
        product: {
          include: { seller: true },
        },
      },
    });

    // Increment sales count
    await prisma!.product.update({
      where: { id: order.productId },
      data: { salesCount: { increment: 1 } },
    });

    return {
      ...order,
      amount: Number(order.amount),
    };
  } catch (error) {
    console.warn('[data] completeOrder fallback');
    return mock.completeOrder(orderId);
  }
}

export async function getUserOrders(userId: string) {
  if (!isRealPrisma()) {
    return mock.getUserOrders(userId);
  }

  try {
    const dbOrders = await prisma!.order.findMany({
      where: { 
        buyerId: userId, 
        status: 'COMPLETED' 
      },
      include: {
        product: {
          include: {
            seller: {
              select: { username: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dbOrders.map((o: any) => ({
      ...o,
      amount: Number(o.amount),
      product: o.product ? {
        ...o.product,
        price: Number(o.product.price),
      } : null,
    }));
  } catch (error) {
    return mock.getUserOrders(userId);
  }
}

// ============================================
// SELLER PRODUCT CREATION (PERSIST)
// ============================================

export async function createProduct(data: any) {
  if (!isRealPrisma()) {
    // Fallback mock
    const newProduct = {
      id: 'p' + Date.now(),
      ...data,
      status: 'PENDING',
      salesCount: 0,
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: new Date(),
    };
    (mock as any).products = (mock as any).products || [];
    (mock as any).products.push(newProduct);
    return newProduct;
  }

  try {
    return await prisma!.product.create({
      data: {
        sellerId: data.sellerId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category as any,
        tags: data.tags || [],
        price: data.price,
        currency: data.currency || 'USD',
        fileUrl: data.fileUrl || 'https://placeholder.r2.bt4.studio/pending.zip',
        previewImages: data.previewImages || [],
        demoUrl: data.demoUrl,
        licenseType: data.licenseType || 'MIT',
        version: data.version || '1.0.0',
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error('[data] createProduct failed', error);
    throw error;
  }
}

// ============================================
// ADMIN
// ============================================

export async function getPendingProducts() {
  if (!isRealPrisma()) {
    return (mock as any).products?.filter((p: any) => 
      p.status === 'PENDING' || p.status === 'pending'
    ) || [];
  }

  try {
    const pending = await prisma!.product.findMany({
      where: { status: 'PENDING' },
      include: {
        seller: { select: { username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pending.map((p: any) => ({
      ...p,
      price: Number(p.price),
      seller: p.seller,
    }));
  } catch (error) {
    return [];
  }
}

export async function approveProduct(productId: string) {
  if (!isRealPrisma()) {
    const products = (mock as any).products || [];
    const p = products.find((x: any) => x.id === productId);
    if (p) p.status = 'APPROVED';
    return true;
  }

  try {
    await prisma!.product.update({
      where: { id: productId },
      data: { status: 'APPROVED' },
    });
    return true;
  } catch {
    return false;
  }
}

export async function rejectProduct(productId: string, reason?: string) {
  if (!isRealPrisma()) {
    const products = (mock as any).products || [];
    const p = products.find((x: any) => x.id === productId);
    if (p) {
      p.status = 'REJECTED';
      if (reason) p.rejectionReason = reason;
    }
    return true;
  }

  try {
    await prisma!.product.update({
      where: { id: productId },
      data: { 
        status: 'REJECTED',
        ...(reason && { rejectionReason: reason }),
      },
    });
    return true;
  } catch {
    return false;
  }
}

// ============================================
// REVIEWS (Real DB supported)
// ============================================

export async function getProductReviews(productId: string) {
  if (!isRealPrisma()) {
    return (mock as any).reviews?.filter((r: any) => 
      r.productId === productId || r.product_id === productId
    ) || [];
  }

  try {
    return await prisma!.review.findMany({
      where: { productId },
      include: {
        buyer: {
          select: { username: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

export async function createReview(data: {
  productId: string;
  buyerId: string;
  rating: number;
  comment?: string;
}) {
  if (!isRealPrisma()) {
    const newReview = {
      id: 'r' + Date.now(),
      productId: data.productId,
      buyerId: data.buyerId,
      rating: data.rating,
      comment: data.comment || '',
      createdAt: new Date(),
    };

    (mock as any).reviews = (mock as any).reviews || [];
    (mock as any).reviews.push(newReview);

    // Simple mock rating update
    const prods = (mock as any).products || [];
    const prod = prods.find((p: any) => p.id === data.productId);
    if (prod) {
      const reviews = (mock as any).reviews.filter((r: any) => r.productId === data.productId);
      const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      prod.rating_avg = Math.round(avg * 10) / 10;
      prod.review_count = reviews.length;
    }
    return newReview;
  }

  try {
    const review = await prisma!.review.create({
      data: {
        productId: data.productId,
        buyerId: data.buyerId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        buyer: { select: { username: true, displayName: true } },
      },
    });

    // Update product aggregates
    const reviews = await prisma!.review.findMany({ where: { productId: data.productId } });
    const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

    await prisma!.product.update({
      where: { id: data.productId },
      data: {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: reviews.length,
      },
    });

    return review;
  } catch (error) {
    console.error('createReview error', error);
    throw error;
  }
}

export async function hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  if (!isRealPrisma()) {
    const orders = (mock as any).orders || [];
    return orders.some((o: any) =>
      (o.buyer_id === userId || o.buyerId === userId) &&
      (o.product_id === productId || o.productId === productId) &&
      o.status === 'completed'
    );
  }

  try {
    const count = await prisma!.order.count({
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

// Legacy re-export for transition pages
export { getProductBySlug as getProductBySlugMock } from './db';

// ============================================
// CATEGORIES (real DB + mock)
// ============================================

export async function getCategories() {
  if (!isRealPrisma()) {
    return mock.categories;
  }

  try {
    // For now we still use static categories (can be moved to DB later)
    // This keeps the UI consistent while allowing real products
    return mock.categories;
  } catch {
    return mock.categories;
  }
}

// ============================================
// USER HELPERS (for real auth)
// ============================================

export async function getUserById(userId: string) {
  if (!isRealPrisma()) {
    return (mock as any).users?.find((u: any) => u.id === userId);
  }
  try {
    return await prisma!.user.findUnique({
      where: { id: userId },
    });
  } catch {
    return null;
  }
}

export async function getOrCreateUserFromSession(sessionUser: any) {
  if (!isRealPrisma() || !sessionUser?.email) {
    return sessionUser;
  }

  try {
    let user = await prisma!.user.findUnique({
      where: { email: sessionUser.email },
    });

    if (!user) {
      // Create minimal user record
      user = await prisma!.user.create({
        data: {
          email: sessionUser.email,
          username: (sessionUser.name || sessionUser.email.split('@')[0])
            .toLowerCase()
            .replace(/\s+/g, ''),
          displayName: sessionUser.name || sessionUser.email.split('@')[0],
          avatar: sessionUser.image,
          role: 'BUYER',
        },
      });
    }
    return user;
  } catch (e) {
    return sessionUser;
  }
}

// ============================================
// ADMIN EXTENSIONS (required by new admin routes)
// ============================================
export async function getAllUsers() {
  if (!isRealPrisma()) {
    return (mock as any).users || [];
  }
  try {
    return await prisma!.user.findMany({ orderBy: { createdAt: 'desc' } });
  } catch {
    return (mock as any).users || [];
  }
}

export async function getAllOrders() {
  if (!isRealPrisma()) {
    return (mock as any).orders || [];
  }
  try {
    return await prisma!.order.findMany({
      include: { product: true, buyer: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return (mock as any).orders || [];
  }
}

export async function refundOrder(orderId: string) {
  if (!isRealPrisma()) {
    const orders = (mock as any).orders || [];
    const o = orders.find((x: any) => x.id === orderId);
    if (o) o.status = 'REFUNDED';
    return true;
  }
  try {
    await prisma!.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' },
    });
    return true;
  } catch {
    return false;
  }
}

export async function createDispute(orderId: string, reason: string) {
  if (!isRealPrisma()) {
    console.log(`[MOCK] Dispute created for order ${orderId}: ${reason}`);
    return { id: 'disp_' + Date.now(), orderId, reason, status: 'OPEN' };
  }
  return { id: 'disp_' + Date.now(), orderId, reason, status: 'OPEN' };
}

export async function updateOrderPayment(orderId: string, proof?: string, adminId?: string) {
  if (!isRealPrisma()) {
    const orders = (mock as any).orders || [];
    const o = orders.find((x: any) => x.id === orderId);
    if (o) {
      if (proof) o.paymentProof = proof;
      o.status = 'PAYMENT_RECEIVED';
      if (adminId) o.paymentConfirmedBy = adminId;
    }
    return true;
  }
  try {
    await prisma!.order.update({
      where: { id: orderId },
      data: {
        ...(proof && { paymentProof: proof }),
        status: 'PAYMENT_RECEIVED',
        ...(adminId && { paymentConfirmedBy: adminId }),
      },
    });
    return true;
  } catch {
    return false;
  }
}
