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
    email: 'admin@codevault.studio',
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
  { id: 'c8', name: 'Datasets', slug: 'datasets', icon: '📊', description: 'Curated datasets for ML & analytics' },
];

export let products: Product[] = [
  {
    id: 'p1',
    seller_id: 'u1',
    seller: users[0],
    title: 'Stripe Connect Dashboard',
    slug: 'stripe-connect-dashboard',
    description: 'Complete Next.js + TypeScript Stripe Connect dashboard with payouts, onboarding, and customer management. Production-ready with beautiful UI.',
    category_id: 'c3',
    category: categories[2],
    price: 89,
    currency: 'USD',
    file_url: 'https://example.com/files/stripe-connect.zip',
    preview_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    tags: ['stripe', 'nextjs', 'dashboard', 'payments'],
    status: 'approved',
    sales_count: 1247,
    rating_avg: 4.9,
    review_count: 312,
    created_at: '2024-11-15T08:00:00Z',
    license: 'MIT',
    version: '2.4.1',
    file_size: '12.8 MB',
    demo_url: 'https://stripe-dashboard-demo.vercel.app',
    preview_images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    ],
    readme: '# Stripe Connect Dashboard\n\nA beautiful and production-ready dashboard...',
    file_tree: [
      { name: 'app', type: 'dir', children: [
        { name: 'dashboard', type: 'dir' },
        { name: 'layout.tsx', type: 'file', size: '4.2 KB' },
      ] },
      { name: 'components', type: 'dir' },
      { name: 'README.md', type: 'file', size: '8.1 KB' },
    ],
  },
  {
    id: 'p2',
    seller_id: 'u2',
    seller: users[1],
    title: 'Modern Design System Kit',
    slug: 'modern-design-system-kit',
    description: 'Complete design system for enterprise products. Includes Figma + React + Tailwind. 120+ components, tokens, and documentation.',
    category_id: 'c4',
    category: categories[3],
    price: 149,
    currency: 'USD',
    file_url: 'https://example.com/files/design-system.zip',
    preview_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop',
    tags: ['design-system', 'figma', 'react', 'tailwind', 'ui'],
    status: 'approved',
    sales_count: 834,
    rating_avg: 4.8,
    review_count: 198,
    created_at: '2024-12-01T10:00:00Z',
    license: 'Commercial',
    version: '1.8.3',
    file_size: '94.2 MB',
    demo_url: 'https://designsystem-demo.vercel.app',
    preview_images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
    ],
  },
  {
    id: 'p3',
    seller_id: 'u3',
    seller: users[2],
    title: 'Type-Safe API Boilerplate',
    slug: 'typescript-api-boilerplate',
    description: 'Production-ready REST + GraphQL API in TypeScript. Includes auth, rate limiting, database, OpenAPI docs, and tests.',
    category_id: 'c5',
    category: categories[4],
    price: 59,
    currency: 'USD',
    file_url: 'https://example.com/files/api-boilerplate.zip',
    preview_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop',
    tags: ['api', 'typescript', 'graphql', 'node', 'prisma'],
    status: 'approved',
    sales_count: 562,
    rating_avg: 4.7,
    review_count: 143,
    created_at: '2024-10-22T14:30:00Z',
    license: 'MIT',
    version: '3.1.0',
    file_size: '8.4 MB',
    demo_url: 'https://api-demo.codevault.dev',
    preview_images: [],
  },
  {
    id: 'p4',
    seller_id: 'u1',
    seller: users[0],
    title: 'SaaS Starter Kit — Next.js 15',
    slug: 'saas-starter-nextjs',
    description: 'Everything you need to launch a SaaS product in days, not months. Auth, billing, team management, admin panel, and more.',
    category_id: 'c6',
    category: categories[5],
    price: 199,
    currency: 'USD',
    file_url: 'https://example.com/files/saas-starter.zip',
    preview_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop',
    tags: ['saas', 'nextjs', 'stripe', 'auth', 'boilerplate'],
    status: 'approved',
    sales_count: 2103,
    rating_avg: 4.9,
    review_count: 487,
    created_at: '2024-09-05T09:00:00Z',
    license: 'Commercial',
    version: '4.2.0',
    file_size: '26.1 MB',
    demo_url: 'https://saas-starter-demo.vercel.app',
    preview_images: [
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    ],
  },
  {
    id: 'p5',
    seller_id: 'u2',
    seller: users[1],
    title: 'Advanced React Hooks Library',
    slug: 'advanced-react-hooks',
    description: 'A collection of 40+ battle-tested, accessible React hooks. Includes useForm, useInfiniteScroll, useDebounce and more.',
    category_id: 'c1',
    category: categories[0],
    price: 39,
    currency: 'USD',
    file_url: 'https://example.com/files/react-hooks.zip',
    preview_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=630&fit=crop',
    tags: ['react', 'hooks', 'typescript', 'library'],
    status: 'approved',
    sales_count: 1892,
    rating_avg: 4.6,
    review_count: 412,
    created_at: '2024-11-28T16:45:00Z',
    license: 'MIT',
    version: '1.3.2',
    file_size: '1.2 MB',
  },
  {
    id: 'p6',
    seller_id: 'u3',
    seller: users[2],
    title: 'Analytics Dashboard Components',
    slug: 'analytics-dashboard-components',
    description: 'Beautiful, customizable analytics dashboard built with Recharts and Tailwind. Includes 20+ chart types.',
    category_id: 'c4',
    category: categories[3],
    price: 69,
    currency: 'USD',
    file_url: 'https://example.com/files/analytics.zip',
    preview_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    tags: ['analytics', 'charts', 'dashboard', 'react'],
    status: 'approved',
    sales_count: 721,
    rating_avg: 4.8,
    review_count: 156,
    created_at: '2024-12-10T11:20:00Z',
    license: 'MIT',
    version: '2.0.0',
    file_size: '4.9 MB',
  },
];

export let orders: Order[] = [
  {
    id: 'o1',
    buyer_id: 'u4',
    product_id: 'p1',
    product: products[0],
    amount: 89,
    currency: 'USD',
    status: 'completed',
    created_at: '2024-12-18T14:22:00Z',
    license_key: 'CV-STRIPE-89A7B2C1',
    download_count: 2,
  },
];

export let reviews: Review[] = [
  {
    id: 'r1',
    product_id: 'p1',
    buyer_id: 'u4',
    buyer: users[3],
    rating: 5,
    comment: 'Absolutely incredible. Saved us weeks of work. The UI is polished beyond belief.',
    created_at: '2024-12-19T10:00:00Z',
  },
];

export let purchaseTokens: PurchaseToken[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const cat = categories.find(c => c.slug === categorySlug);
  if (!cat) return [];
  return products.filter(p => p.category_id === cat.id && p.status === 'approved');
}

export function getAllApprovedProducts(): Product[] {
  return products.filter(p => p.status === 'approved');
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(p => 
    p.status === 'approved' &&
    (p.title.toLowerCase().includes(q) || 
     p.description.toLowerCase().includes(q) || 
     p.tags.some(t => t.toLowerCase().includes(q)))
  );
}

export function createPurchaseToken(productId: string, price: number): string {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  
  purchaseTokens.push({
    id: token,
    product_id: productId,
    price,
    expires_at: expires,
    used: false,
  });
  return token;
}

export function validatePurchaseToken(token: string): { valid: boolean; product?: Product; price?: number } {
  const pt = purchaseTokens.find(t => t.id === token && !t.used);
  if (!pt) return { valid: false };
  
  const now = new Date();
  if (new Date(pt.expires_at) < now) return { valid: false };
  
  const product = products.find(p => p.id === pt.product_id);
  if (!product) return { valid: false };
  
  return { valid: true, product, price: pt.price };
}

export function completePurchase(token: string, buyerId: string): Order | null {
  const ptIndex = purchaseTokens.findIndex(t => t.id === token);
  if (ptIndex === -1) return null;
  
  const pt = purchaseTokens[ptIndex];
  if (pt.used) return null;
  
  const product = products.find(p => p.id === pt.product_id);
  if (!product) return null;

  const order: Order = {
    id: 'o' + Date.now(),
    buyer_id: buyerId,
    product_id: product.id,
    product,
    amount: pt.price,
    currency: product.currency,
    status: 'completed',
    created_at: new Date().toISOString(),
    license_key: `CV-${product.id.toUpperCase().slice(0,6)}-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
    download_count: 0,
  };
  
  orders.push(order);
  product.sales_count += 1;
  purchaseTokens[ptIndex].used = true;
  
  return order;
}