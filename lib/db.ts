import { Product, User, Category, Order, Review, PurchaseToken } from './types';

// Mock in-memory database for Vercel deployment (production-ready with easy swap to Supabase/Postgres)
export let users: User[] = [
  {
    id: 'u1',
    email: 'sarah@dev.com',
    username: 'sarahcodes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    bio: 'Full-stack engineer building beautiful developer tools. 8 years at Vercel and Stripe.',
    role: 'seller',
    stripe_connect_id: 'acct_123',
    telegram_id: '123456789',
    github: 'sarahcodes',
    created_at: '2024-01-15T10:00:00Z',
    verified: true,
  },
  {
    id: 'u2',
    email: 'alex@design.dev',
    username: 'alexbuilds',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Design systems engineer. Previously at Figma and Linear.',
    role: 'seller',
    github: 'alexbuilds',
    created_at: '2024-02-01T10:00:00Z',
    verified: true,
  },
  {
    id: 'u3',
    email: 'mike@backend.dev',
    username: 'mikecodes',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Building scalable APIs and backend systems.',
    role: 'seller',
    created_at: '2024-03-10T10:00:00Z',
  },
  {
    id: 'u4',
    email: 'buyer@example.com',
    username: 'janebuyer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'buyer',
    created_at: '2024-04-20T10:00:00Z',
  },
  {
    id: 'u5',
    email: 'admin@bt4.studio',
    username: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    role: 'admin',
    created_at: '2024-01-01T10:00:00Z',
  },
];

export let categories: Category[] = [
  { id: 'c1', name: 'React', slug: 'react', icon: '⚛️', description: 'React components, hooks & libraries' },
  { id: 'c2', name: 'TypeScript', slug: 'typescript', icon: '📘', description: 'Type-safe utilities & types' },
  { id: 'c3', name: 'Next.js', slug: 'nextjs', icon: '▲', description: 'Next.js apps, templates & plugins' },
  { id: 'c4', name: 'UI Kits', slug: 'ui-kits', icon: '🎨', description: 'Design systems and component libraries' },
  { id: 'c5', name: 'APIs', slug: 'apis', icon: '🔌', description: 'REST, GraphQL & backend services' },
  { id: 'c6', name: 'SaaS Starters', slug: 'saas', icon: '🚀', description: 'Production-ready SaaS boilerplates' },
  { id: 'c7', name: 'DevTools', slug: 'devtools', icon: '🛠️', description: 'CLI, scripts, and developer tooling' },
];

export let products: Product[] = [
  {
    id: 'p1', seller_id: 'u1', seller: users[0], title: 'Stripe Connect Dashboard', slug: 'stripe-connect-dashboard',
    description: 'Complete Next.js + TypeScript Stripe Connect dashboard with payouts, onboarding, and customer management.',
    category_id: 'c3', category: categories[2], price: 89, currency: 'USD',
    file_url: 'https://example.com/files/stripe-connect.zip',
    preview_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    tags: ['stripe', 'nextjs', 'dashboard', 'payments'], status: 'approved',
    sales_count: 1247, rating_avg: 4.9, review_count: 312, created_at: '2024-11-15T08:00:00Z',
    license: 'MIT', version: '2.4.1', file_size: '12.8 MB', demo_url: 'https://stripe-dashboard-demo.vercel.app',
    preview_images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'],
  },
  {
    id: 'p2', seller_id: 'u2', seller: users[1], title: 'Modern Design System Kit', slug: 'modern-design-system-kit',
    description: 'Complete design system for enterprise products. Includes Figma + React + Tailwind.',
    category_id: 'c4', category: categories[3], price: 149, currency: 'USD',
    file_url: 'https://example.com/files/design-system.zip',
    preview_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop',
    tags: ['design-system', 'figma', 'react', 'tailwind'], status: 'approved',
    sales_count: 834, rating_avg: 4.8, review_count: 198, created_at: '2024-12-01T10:00:00Z',
    license: 'Commercial', version: '1.8.3', file_size: '94.2 MB', demo_url: 'https://designsystem-demo.vercel.app',
  },
];

export let orders: Order[] = [];
export let reviews: Review[] = [];
export let purchaseTokens: PurchaseToken[] = [];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getAllApprovedProducts(): Product[] {
  return products.filter(p => p.status === 'approved');
}

export function createPurchaseToken(productId: string, price: number): string {
  const token = crypto.randomUUID();
  const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  
  purchaseTokens.push({ id: token, product_id: productId, price, expires_at, used: false });
  return token;
}

export function validatePurchaseToken(token: string): { valid: boolean; product?: Product; price?: number } {
  const pt = purchaseTokens.find(t => t.id === token && !t.used);
  if (!pt) return { valid: false };
  if (new Date(pt.expires_at) < new Date()) return { valid: false };
  
  const product = products.find(p => p.id === pt.product_id);
  return product ? { valid: true, product, price: pt.price } : { valid: false };
}

// Creates a pending order when user starts purchase via Telegram
export function createPendingOrder(productId: string, buyerId: string, amount: number): Order {
  const product = products.find(p => p.id === productId)!;
  const order: Order = {
    id: 'ord_' + Date.now(),
    buyer_id: buyerId,
    product_id: productId,
    product,
    amount,
    currency: product.currency,
    status: 'pending',
    created_at: new Date().toISOString(),
    download_count: 0,
    license_key: null,
  };
  orders.push(order);
  return order;
}

export function completeOrder(orderId: string): Order | null {
  const order = orders.find(o => o.id === orderId);
  if (!order || order.status !== 'pending') return null;

  order.status = 'completed';
  order.license_key = `BT4-${order.product_id.toUpperCase().slice(0,6)}-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
  order.download_token = crypto.randomUUID();
  order.download_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Increment sales
  const product = products.find(p => p.id === order.product_id);
  if (product) product.sales_count += 1;

  return order;
}

export function getUserOrders(userId: string): Order[] {
  return orders.filter(o => o.buyer_id === userId && o.status === 'completed');
}
