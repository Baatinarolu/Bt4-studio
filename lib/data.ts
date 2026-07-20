/**
 * BT4 Studio - Unified Data Access Layer
 * 
 * Tries real Prisma when available, falls back to high-quality mock DB.
 * This is the single source of truth for data operations going forward.
 */

import * as mock from './db';
import { prisma } from './prisma';
import type { Product, Order, User } from './types';

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
    return mapPrismaProducts(dbProducts);
  } catch (e) {
    console.warn('[data] Prisma failed, falling back to mock');
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
    return p ? mapPrismaProduct(p) : undefined;
  } catch {
    return mock.getProductBySlug(slug);
  }
}

// ============================================
// PURCHASE / ORDER FLOW
// ============================================

export async function createPurchaseToken(productId: string, price: number): Promise<string> {
  if (!prisma) return mock.createPurchaseToken(productId, price);

  try {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Using raw for simplicity until we add a proper PurchaseToken model usage
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
    return mapPrismaOrder(order);
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
      include: {
        product: { include: { seller: true } },
        license: true,
      },
    });

    // Increment sales
    await prisma.product.update({
      where: { id: order.productId },
      data: { salesCount: { increment: 1 } },
    });

    return mapPrismaOrder(order);
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
    return dbOrders.map(mapPrismaOrder);
  } catch {
    return mock.getUserOrders(userId);
  }
}

// ============================================
// SELLER PRODUCT CREATION
// ============================================

export async function createProduct(data: any) {
  if (!prisma) {
    // Fallback to mock for demo
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
// HELPERS
// ============================================

function mapPrismaProduct(p: any): Product {
  return {
    id: p.id,
    seller_id: p.sellerId,
    seller: p.seller,
    title: p.title,
    slug: p.slug,
    description: p.description,
    category_id: p.category,
    category: { id: p.category, name: p.category, slug: p.category.toLowerCase(), icon: '' },
    price: Number(p.price),
    currency: p.currency,
    file_url: p.fileUrl,
    preview_url: p.previewImages?.[0],
    tags: p.tags,
    status: p.status.toLowerCase(),
    sales_count: p.salesCount,
    rating_avg: p.ratingAvg,
    review_count: p.ratingCount,
    created_at: p.createdAt.toISOString(),
    license: p.licenseType,
    version: p.version,
    file_size: '—',
    demo_url: p.demoUrl,
    preview_images: p.previewImages,
  };
}

function mapPrismaProducts(products: any[]): Product[] {
  return products.map(mapPrismaProduct);
}

function mapPrismaOrder(o: any): any {
  return {
    id: o.id,
    buyer_id: o.buyerId,
    product_id: o.productId,
    product: o.product ? mapPrismaProduct(o.product) : undefined,
    amount: Number(o.amount),
    currency: 'USD',
    status: o.status.toLowerCase(),
    created_at: o.createdAt.toISOString(),
    license_key: o.license?.key || null,
    download_count: 0,
    download_token: o.downloadToken,
    download_expires: o.downloadExpires?.toISOString(),
  };
}

// Re-export mock helpers for gradual migration
export { 
  getProductBySlug as getProductBySlugMock,
  getAllApprovedProducts as getAllApprovedProductsMock 
} from './db';
