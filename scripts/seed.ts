/**
 * BT4 Studio - Database Seed Script
 * 
 * Run with: npx prisma db seed   (after setting DATABASE_URL)
 * or: npm run db:seed
 * 
 * This creates realistic demo data that matches the current UI.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BT4 Studio database...');

  // Clean up in development
  await prisma.review.deleteMany();
  await prisma.license.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // === USERS ===
  const seller1 = await prisma.user.create({
    data: {
      email: 'sarah@dev.com',
      username: 'sarahcodes',
      displayName: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack engineer building beautiful developer tools. 8 years at Vercel and Stripe.',
      role: 'SELLER',
      telegramId: '123456789',
      github: 'sarahcodes',
      isVerified: true,
      stripeConnectId: 'acct_123',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'alex@design.dev',
      username: 'alexbuilds',
      displayName: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Design systems engineer. Previously at Figma and Linear.',
      role: 'SELLER',
      github: 'alexbuilds',
      isVerified: true,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'jane@buyer.dev',
      username: 'janebuyer',
      displayName: 'Jane Cooper',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      role: 'BUYER',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@bt4.studio',
      username: 'admin',
      displayName: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      role: 'ADMIN',
    },
  });

  // === CATEGORIES ===
  const catNext = await prisma.category.create({
    data: { name: 'Next.js', slug: 'nextjs', icon: '▲', description: 'Next.js apps, templates & plugins' },
  });
  const catUI = await prisma.category.create({
    data: { name: 'UI Kits', slug: 'ui-kits', icon: '🎨', description: 'Design systems and component libraries' },
  });
  const catAPI = await prisma.category.create({
    data: { name: 'APIs', slug: 'apis', icon: '🔌', description: 'REST, GraphQL & backend services' },
  });
  const catSaaS = await prisma.category.create({
    data: { name: 'SaaS Starters', slug: 'saas', icon: '🚀', description: 'Production-ready SaaS boilerplates' },
  });
  const catReact = await prisma.category.create({
    data: { name: 'React', slug: 'react', icon: '⚛️', description: 'React components, hooks & libraries' },
  });

  // === PRODUCTS ===
  const product1 = await prisma.product.create({
    data: {
      sellerId: seller1.id,
      title: 'Stripe Connect Dashboard',
      slug: 'stripe-connect-dashboard',
      description: 'Complete Next.js + TypeScript Stripe Connect dashboard with payouts, onboarding, and customer management. Production-ready with beautiful UI.',
      category: 'NEXTJS',
      tags: ['stripe', 'nextjs', 'dashboard', 'payments'],
      price: 89,
      currency: 'USD',
      fileUrl: 'https://r2.bt4.studio/demo/stripe-connect.zip', // placeholder
      previewImages: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'],
      demoUrl: 'https://stripe-dashboard-demo.vercel.app',
      licenseType: 'MIT',
      status: 'APPROVED',
      salesCount: 1247,
      ratingAvg: 4.9,
      ratingCount: 312,
      version: '2.4.1',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sellerId: seller2.id,
      title: 'Modern Design System Kit',
      slug: 'modern-design-system-kit',
      description: 'Complete design system for enterprise products. Includes Figma + React + Tailwind. 120+ components, tokens, and documentation.',
      category: 'UI_KITS',
      tags: ['design-system', 'figma', 'react', 'tailwind'],
      price: 149,
      currency: 'USD',
      fileUrl: 'https://r2.bt4.studio/demo/design-system.zip',
      previewImages: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'],
      demoUrl: 'https://designsystem-demo.vercel.app',
      licenseType: 'COMMERCIAL',
      status: 'APPROVED',
      salesCount: 834,
      ratingAvg: 4.8,
      ratingCount: 198,
      version: '1.8.3',
    },
  });

  // === SAMPLE ORDER (from previous Telegram purchase) ===
  const sampleOrder = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      productId: product1.id,
      amount: 89,
      platformFee: 17.8,
      sellerEarnings: 71.2,
      status: 'COMPLETED',
      downloadToken: 'dl_' + crypto.randomUUID(),
      downloadExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      license: {
        create: {
          key: 'BT4-P1-9K2M4X7P',
          usageLimit: 5,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // === SAMPLE REVIEW ===
  await prisma.review.create({
    data: {
      productId: product1.id,
      buyerId: buyer.id,
      rating: 5,
      comment: 'Absolutely incredible. Saved us weeks of work. The UI is polished beyond belief.',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Created:`);
  console.log(`- ${await prisma.user.count()} users`);
  console.log(`- ${await prisma.product.count()} products`);
  console.log(`- ${await prisma.order.count()} orders`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
