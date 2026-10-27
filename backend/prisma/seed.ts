import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (existing) {
    console.log('Seed already exists');
    return;
  }

  const passwordHash = await argon2.hash('Admin123!');

  const shop = await prisma.shop.create({
    data: {
      name: 'Demo Store',
      currency: 'ETB',
      address: 'Addis Ababa',
      phone: '+251911000000',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Demo Owner',
      email: 'admin@example.com',
      passwordHash,
      memberships: {
        create: {
          shopId: shop.id,
          role: 'OWNER',
        },
      },
    },
  });

  const product = await prisma.product.create({
    data: {
      shopId: shop.id,
      name: 'Wireless Headphones',
      description: 'General retail example product',
      defaultSellingPrice: 1500,
    },
  });

  const item = await prisma.item.create({
    data: {
      shopId: shop.id,
      productId: product.id,
      publicIdentifier: 'ITEM-001',
      uniqueQrCode: 'QR-ITEM-001',
      costPrice: 900,
      sellingPrice: 1500,
      createdByUserId: user.id,
      status: 'IN_STOCK',
    },
  });

  console.log('Seeded demo store', { shopId: shop.id, userId: user.id, productId: product.id, itemId: item.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
