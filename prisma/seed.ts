import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BT4 Studio (Prisma 6)...');

  // Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bt4.studio' },
    update: {},
    create: {
      email: 'admin@bt4.studio',
      username: 'admin',
      displayName: 'BT4 Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('YourSecurePassword123!', 12),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face',
    },
  });
  console.log('✅ Admin ready:', admin.username);

  // Seller 1
  const seller1 = await prisma.user.upsert({
    where: { email: 'sarah@dev.com' },
    update: {},
    create: {
      email: 'sarah@dev.com',
      username: 'sarahcodes',
      displayName: 'Sarah Chen',
      role: 'SELLER',
      passwordHash: await bcrypt.hash('seller123', 10),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face',
      bio: 'Full-stack engineer building beautiful developer tools.',
      isSellerApproved: true,
      payoutWallet: 'TBT4STUDIO1234567890DEMOABCDEF',
    },
  });

  // Seller 2
  const seller2 = await prisma.user.upsert({
    where: { email: 'alex@design.dev' },
    update: {},
    create: {
      email: 'alex@design.dev',
      username: 'alexbuilds',
      displayName: 'Alex Rivera',
      role: 'SELLER',
      passwordHash: await bcrypt.hash('seller123', 10),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
      bio: 'Design systems engineer.',
      isSellerApproved: true,
    },
  });

  // Buyer
  await prisma.user.upsert({
    where: { email: 'janebuyer@example.com' },
    update: {},
    create: {
      email: 'janebuyer@example.com',
      username: 'janebuyer',
      displayName: 'Jane Buyer',
      role: 'BUYER',
      passwordHash: await bcrypt.hash('buyer123', 10),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
    },
  });

  // Seed 5 approved products (idempotent)
  const products = [
    {
      sellerId: seller1.id,
      title: 'Stripe Connect Dashboard',
      slug: 'stripe-connect-dashboard',
      description: 'Complete Next.js + TypeScript Stripe Connect dashboard with payouts, onboarding, and customer management.',
      category: 'NEXTJS',
      price: 89,
      fileUrl: 'https://placeholder.supabase.co/storage/v1/object/public/product-files/stripe-connect.zip',
      previewImages: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop'],
      status: 'APPROVED' as const,
      salesCount: 1247,
      ratingAvg: 4.9,
      ratingCount: 312,
      licenseType: 'MIT',
      version: '2.4.1',
      demoUrl: 'https://stripe-dashboard-demo.vercel.app',
      tags: ['stripe', 'nextjs', 'dashboard'],
    },
    {
      sellerId: seller2.id,
      title: 'Modern Design System Kit',
      slug: 'modern-design-system-kit',
      description: 'Complete design system for enterprise products. Includes Figma + React + Tailwind.',
      category: 'UI_KITS',
      price: 149,
      fileUrl: 'https://placeholder.supabase.co/storage/v1/object/public/product-files/design-system.zip',
      previewImages: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop'],
      status: 'APPROVED' as const,
      salesCount: 834,
      ratingAvg: 4.8,
      ratingCount: 198,
      licenseType: 'Commercial',
      version: '1.8.3',
      demoUrl: 'https://designsystem-demo.vercel.app',
      tags: ['design-system', 'figma', 'react'],
    },
    // ... (shortened for brevity — full 5 products already exist in scripts/seed.ts)
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { status: 'APPROVED' },
      create: p as any,
    });
  }

  console.log('✅ Seeded admin + sellers + sample products.');
  console.log('Login: admin@bt4.studio / YourSecurePassword123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
