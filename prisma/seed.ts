/**
 * Database Seed Script
 * 
 * Creates sample data for testing the interview exercises
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.idempotencyKey.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.inventoryReservation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith'
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Davis'
    }
  });

  console.log(`✓ Created ${3} users`);

  // Create products
  console.log('Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones',
        price: 199.99,
        stockQuantity: 50
      }
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand',
        price: 49.99,
        stockQuantity: 100
      }
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical gaming keyboard',
        price: 129.99,
        stockQuantity: 30
      }
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI and SD card reader',
        price: 39.99,
        stockQuantity: 75
      }
    }),
    prisma.product.create({
      data: {
        name: 'Webcam',
        description: '1080p HD webcam with auto-focus',
        price: 79.99,
        stockQuantity: 40
      }
    }),
    prisma.product.create({
      data: {
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        price: 34.99,
        stockQuantity: 60
      }
    }),
    prisma.product.create({
      data: {
        name: 'Mouse Pad',
        description: 'Extra large gaming mouse pad',
        price: 19.99,
        stockQuantity: 200
      }
    }),
    prisma.product.create({
      data: {
        name: 'Phone Stand',
        description: 'Adjustable phone and tablet stand',
        price: 14.99,
        stockQuantity: 150
      }
    })
  ]);

  console.log(`✓ Created ${products.length} products`);

  // Create sample orders with different statuses
  console.log('Creating sample orders...');
  
  // Pending order (ready for fulfillment exercise)
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'PENDING',
      total: 249.98,
      items: {
        create: [
          {
            productId: products[0].id, // Wireless Headphones
            quantity: 1,
            priceAtPurchase: 199.99
          },
          {
            productId: products[1].id, // Laptop Stand
            quantity: 1,
            priceAtPurchase: 49.99
          }
        ]
      },
      payments: {
        create: {
          amount: 249.98,
          status: 'COMPLETED',
          paymentMethod: 'credit_card',
          metadata: JSON.stringify({
            cardLast4: '4242',
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  });

  // Another pending order (for payment exercise)
  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'PENDING',
      total: 129.99,
      items: {
        create: [
          {
            productId: products[2].id, // Mechanical Keyboard
            quantity: 1,
            priceAtPurchase: 129.99
          }
        ]
      }
    }
  });

  // Completed order (for reference)
  const order3 = await prisma.order.create({
    data: {
      userId: user3.id,
      status: 'COMPLETED',
      total: 94.98,
      items: {
        create: [
          {
            productId: products[3].id, // USB-C Hub
            quantity: 1,
            priceAtPurchase: 39.99
          },
          {
            productId: products[5].id, // Desk Lamp
            quantity: 1,
            priceAtPurchase: 34.99
          },
          {
            productId: products[6].id, // Mouse Pad
            quantity: 1,
            priceAtPurchase: 19.99
          }
        ]
      },
      payments: {
        create: {
          amount: 94.98,
          status: 'COMPLETED',
          paymentMethod: 'paypal',
          metadata: JSON.stringify({
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  });

  console.log(`✓ Created ${3} orders`);

  // Create coupons (including one with string discount for type bug exercise)
  console.log('Creating coupons...');
  
  const coupon1 = await prisma.coupon.create({
    data: {
      code: 'SAVE10',
      discount: '10', // STRING!
      description: '10% off your order',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  const coupon2 = await prisma.coupon.create({
    data: {
      code: 'SAVE25',
      discount: '25', // STRING!
      description: '25% off your order',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  const coupon3 = await prisma.coupon.create({
    data: {
      code: 'EXPIRED',
      discount: '50',
      description: 'Expired coupon',
      expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Expired 7 days ago
    }
  });

  // This one has bad data
  const coupon4 = await prisma.coupon.create({
    data: {
      code: 'BUGGY',
      discount: '15%', // BAD! Has percentage sign as string
      description: 'Buggy coupon with invalid discount format'
    }
  });

  console.log(`✓ Created ${4} coupons`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: 3`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Orders: 3 (1 pending for fulfillment, 1 pending for payment, 1 completed)`);
  console.log(`   Coupons: 4 (including buggy ones for post-mortem)`);
  console.log('\n🎯 Test Data:');
  console.log(`   Fulfillment Test Order: ${order1.id}`);
  console.log(`   Payment Test Order: ${order2.id}`);
  console.log(`   Valid Coupon: SAVE10`);
  console.log(`   Buggy Coupon: BUGGY (for post-mortem exercise)`);
  console.log(`   User IDs: ${user1.id}, ${user2.id}, ${user3.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

