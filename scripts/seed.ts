import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BT4 Studio MVP data...');

  // Clean existing for idempotency (dev only)
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bt4.studio',
      username: 'admin',
      displayName: 'BT4 Admin',
      role: 'ADMIN',
      passwordHash: adminPassword,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face',
    },
  });

  // 2. Sellers
  const seller1Pass = await bcrypt.hash('seller123', 10);
  const seller1 = await prisma.user.create({
    data: {
      email: 'sarah@dev.com',
      username: 'sarahcodes',
      displayName: 'Sarah Chen',
      role: 'SELLER',
      passwordHash: seller1Pass,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face',
      bio: 'Full-stack engineer building beautiful developer tools.',
      isSellerApproved: true,
      payoutWallet: 'TRC20ABC123456789',
    },
  });

  const seller2Pass = await bcrypt.hash('seller123', 10);
  const seller2 = await prisma.user.create({
    data: {
      email: 'alex@design.dev',
      username: 'alexbuilds',
      displayName: 'Alex Rivera',
      role: 'SELLER',
      passwordHash: seller2Pass,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
      bio: 'Design systems engineer. Previously at Figma.',
      isSellerApproved: true,
      payoutWallet: 'TRC20XYZ987654321',
    },
  });

  // Buyer
  const buyerPass = await bcrypt.hash('buyer123', 10);
  const buyer = await prisma.user.create({
    data: {
      email: 'janebuyer@example.com',
      username: 'janebuyer',
      displayName: 'Jane Buyer',
      role: 'BUYER',
      passwordHash: buyerPass,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
    },
  });

  // 5 Products (APPROVED for marketplace)
  const products = [
    {
      sellerId: seller1.id,
      title: 'Stripe Connect Dashboard',
      slug: 'stripe-connect-dashboard',
      description: 'Complete Next.js + TypeScript Stripe Connect dashboard with payouts, onboarding, and customer management. Production-ready with real-time webhooks.',
      category: 'NEXTJS',
      price: 89,
      fileUrl: 'https://placeholder.r2.bt4.studio/stripe-connect.zip',
      previewImages: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop'],
      status: 'APPROVED' as const,
      salesCount: 1247,
      ratingAvg: 4.9,
      ratingCount: 312,
      licenseType: 'MIT',
      version: '2.4.1',
      demoUrl: 'https://stripe-dashboard-demo.vercel.app',
      tags: ['stripe', 'nextjs', 'dashboard', 'payments'],
    },
    {
      sellerId: seller2.id,
      title: 'Modern Design System Kit',
      slug: 'modern-design-system-kit',
      description: 'Complete design system for enterprise products. Includes Figma + React + Tailwind. 120+ components, full docs, dark mode, and accessibility.',
      category: 'UI_KITS',
      price: 149,
      fileUrl: 'https://placeholder.r2.bt4.studio/design-system.zip',
      previewImages: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop'],
      status: 'APPROVED' as const,
      salesCount: 834,
      ratingAvg: 4.8,
      ratingCount: 198,
      licenseType: 'Commercial',
      version: '1.8.3',
      demoUrl: 'https://designsystem-demo.vercel.app',
      tags: ['design-system', 'figma', 'react', 'tailwind'],
    },
    {
      sellerId: seller1.id,
      title: 'Next.js SaaS Starter Kit',
      slug: 'nextjs-saas-starter-kit',
      description: 'Full-featured SaaS starter: auth, billing, teams, admin dashboard, API routes. Built with Next.js 15, Prisma, Stripe, and Tailwind.',
      category: 'SAAS',
      price: 129,
      fileUrl: 'https://placeholder.r2.bt4.studio/saas-starter.zip',
      previewImages: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop'],
      status: 'APPROVED' as const,
      salesCount: 567,
      ratingAvg: 4.9,
      ratingCount: 142,
      licenseType: 'Commercial',
      version: '3.1.0',
      demoUrl: 'https://saas-starter-demo.vercel.app',
      tags: ['saas', 'nextjs', 'stripe', 'auth'],
    },
    {
      sellerId: seller2.id,
      title: 'TypeScript API Utilities',
      slug: 'typescript-api-utilities',
      description: 'Battle-tested TypeScript utilities for REST & GraphQL APIs. Validation, pagination, caching, rate limiting, and error handling.',
      category: 'APIS',
      price: 39,
      fileUrl: 'https://placeholder.r2.bt4.studio/ts-api-utils.zip',
      previewImages: ['https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop'],
      status: 'APPROVED' as const,
      salesCount: 2103,
      ratingAvg: 4.7,
      ratingCount: 421,
      licenseType: 'MIT',
      version: '1.2.4',
      demoUrl: null,
      tags: ['typescript', 'api', 'utilities'],
    },
    {
      sellerId: seller1.id,
      title: 'React Component Library',
      slug: 'react-component-library',
      description: 'Headless + styled React components. 80+ primitives, fully accessible, TypeScript, Tailwind variants, storybook docs included.',
      category: 'REACT',
      price: 69,
      fileUrl: 'https://placeholder.r2.bt4.studio/react-lib.zip',
      previewImages: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop'],
      status: 'APPROVED' as const,
      salesCount: 892,
      ratingAvg: 4.6,
      ratingCount: 176,
      licenseType: 'MIT',
      version: '4.0.2',
      demoUrl: 'https://react-lib-demo.vercel.app',
      tags: ['react', 'components', 'ui', 'headless'],
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`✅ Seeded: 1 admin, 2 sellers, 1 buyer, 5 approved products.`);
  console.log(`Login: admin@bt4.studio / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
