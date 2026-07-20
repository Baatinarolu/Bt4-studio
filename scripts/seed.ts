import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CodeVault Studio database...');

  // Clean existing data (for dev)
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const seller1 = await prisma.user.create({
    data: {
      email: 'sarah@dev.com',
      username: 'sarahcodes',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack engineer building beautiful developer tools. 8 years at Vercel and Stripe.',
      role: 'seller',
      stripeConnectId: 'acct_123',
      telegramId: '123456789',
      github: 'sarahcodes',
      verified: true,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'alex@design.dev',
      username: 'alexbuilds',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Design systems engineer. Previously at Figma and Linear.',
      role: 'seller',
      github: 'alexbuilds',
      verified: true,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      username: 'janebuyer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      role: 'buyer',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@codevault.studio',
      username: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      role: 'admin',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'React', slug: 'react', icon: '⚛️', description: 'React components, hooks & libraries' } }),
    prisma.category.create({ data: { name: 'Next.js', slug: 'nextjs', icon: '▲', description: 'Next.js apps, templates & plugins' } }),
    prisma.category.create({ data: { name: 'UI Kits', slug: 'ui-kits', icon: '🎨', description: 'Design systems and component libraries' } }),
    prisma.category.create({ data: { name: 'APIs', slug: 'apis', icon: '🔌', description: 'REST, GraphQL & backend services' } }),
    prisma.category.create({ data: { name: 'SaaS Starters', slug: 'saas', icon: '🚀', description: 'Production-ready SaaS boilerplates' } }),
  ]);

  // Products
  await prisma.product.create({
    data: {
      sellerId: seller1.id,
      title: 'Stripe Connect Dashboard',
      slug: 'stripe-connect-dashboard',
      description: 'Complete Next.js + TypeScript Stripe Connect dashboard with payouts, onboarding, and customer management.',
      categoryId: categories[1].id,
      price: 89,
      currency: 'USD',
      fileUrl: 'https://example.com/files/stripe-connect.zip',
      previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
      tags: ['stripe', 'nextjs', 'dashboard', 'payments'],
      status: 'approved',
      salesCount: 1247,
      ratingAvg: 4.9,
      reviewCount: 312,
      license: 'MIT',
      version: '2.4.1',
      fileSize: '12.8 MB',
      demoUrl: 'https://stripe-dashboard-demo.vercel.app',
      previewImages: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      ],
    },
  });

  await prisma.product.create({
    data: {
      sellerId: seller2.id,
      title: 'Modern Design System Kit',
      slug: 'modern-design-system-kit',
      description: 'Complete design system for enterprise products. Includes Figma + React + Tailwind.',
      categoryId: categories[2].id,
      price: 149,
      currency: 'USD',
      fileUrl: 'https://example.com/files/design-system.zip',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      tags: ['design-system', 'figma', 'react', 'tailwind'],
      status: 'approved',
      salesCount: 834,
      ratingAvg: 4.8,
      reviewCount: 198,
      license: 'Commercial',
      version: '1.8.3',
      fileSize: '94.2 MB',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Created: ${await prisma.user.count()} users, ${await prisma.product.count()} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
