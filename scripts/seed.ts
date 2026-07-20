/**
 * BT4 Studio - Production Database Seed
 * 
 * Run with:
 *   npx prisma db seed
 *   or
 *   npm run db:seed
 * 
 * This script works with both development and production Postgres.
 * It creates realistic demo data matching the current UI.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BT4 Studio database...');

  // Clean existing data (safe for dev)
  await prisma.review.deleteMany();
  await prisma.license.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // USERS
  // ============================================
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

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bt4.studio',
      username: 'admin',
      displayName: 'Platform Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created users');

  // ============================================
  // PRODUCTS
  // ============================================
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
      fileUrl: 'https://r2.bt4.studio/demo/stripe-connect.zip',
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

  const product3 = await prisma.product.create({
    data: {
      sellerId: seller1.id,
      title: 'SaaS Starter Kit - Next.js',
      slug: 'saas-starter-kit-nextjs',
      description: 'Production-ready SaaS starter with authentication, billing, team management, and beautiful dashboard.',
      category: 'SAAS_STARTERS',
      tags: ['saas', 'nextjs', 'stripe', 'auth'],
      price: 129,
      currency: 'USD',
      fileUrl: 'https://r2.bt4.studio/demo/saas-starter.zip',
      previewImages: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
      demoUrl: 'https://saas-demo.vercel.app',
      licenseType: 'COMMERCIAL',
      status: 'APPROVED',
      salesCount: 562,
      ratingAvg: 4.7,
      ratingCount: 143,
      version: '3.1.0',
    },
  });

  console.log('✅ Created products');

  // ============================================
  // SAMPLE ORDER + LICENSE + REVIEW
  // ============================================
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
    },
  });

  await prisma.license.create({
    data: {
      orderId: sampleOrder.id,
      productId: product1.id,
      buyerId: buyer.id,
      key: 'BT4-P1-9K2M4X7P',
      usageLimit: 5,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.review.create({
    data: {
      productId: product1.id,
      buyerId: buyer.id,
      rating: 5,
      comment: 'Absolutely incredible. Saved us weeks of work. The UI is polished beyond belief.',
    },
  });

  console.log('✅ Created sample order, license, and review');

  // ============================================
  // SUMMARY
  // ============================================
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();

  console.log('\n🎉 Seed completed successfully!');
  console.log(`   Users:    ${userCount}`);
  console.log(`   Products: ${productCount}`);
  console.log(`   Orders:   ${orderCount}`);
  console.log('\nDemo accounts:');
  console.log('   Seller: sarah@dev.com / alex@design.dev');
  console.log('   Buyer:  jane@buyer.dev');
  console.log('   Admin:  admin@bt4.studio');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
