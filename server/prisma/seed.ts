import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create margins data (Class A to E with margins 15, 12, 9, 6, 3)
  const marginsData = [
    { class: 'A', margin: 15 },
    { class: 'B', margin: 12 },
    { class: 'C', margin: 9 },
    { class: 'D', margin: 6 },
    { class: 'E', margin: 3 }
  ];

  console.log('📊 Creating margins data...');
  for (const marginData of marginsData) {
    await prisma.margin.upsert({
      where: { class: marginData.class },
      update: { margin: marginData.margin },
      create: marginData
    });
  }

  // First, let's create a sample wholesaler user if it doesn't exist
  const wholesaler = await prisma.user.upsert({
    where: { phone: '+1234567890' },
    update: {},
    create: {
      id: 'sample-wholesaler-id',
      phone: '+1234567890',
      businessName: 'Sample Wholesaler',
      isWholesaler: true,
      address: '123 Sample Street',
      email: 'wholesaler@example.com',
      contactNumber: '+1234567890'
    }
  });

  // Create a test user for cart testing
  const testUser = await prisma.user.upsert({
    where: { id: 'test-user' },
    update: {},
    create: {
      id: 'test-user',
      phone: '+1111111111',
      businessName: 'Test User',
      isWholesaler: false,
      address: 'Test Address',
      email: 'test@example.com',
      contactNumber: '+1111111111'
    }
  });

  // Create sample products
  const sampleProducts = [
    {
      product_name: 'Paracetamol 500mg',
      manufacturer: 'Generic Pharma',
    },
    {
      product_name: 'Amoxicillin 250mg',
      manufacturer: 'MediCorp',
    },
    {
      product_name: 'Aspirin 75mg',
      manufacturer: 'HealthPlus',
    },
    {
      product_name: 'Ibuprofen 400mg',
      manufacturer: 'Generic Pharma',
    },
    {
      product_name: 'Cetirizine 10mg',
      manufacturer: 'MediCorp',
    }
  ];

  for (const productData of sampleProducts) {
    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        product_name: productData.product_name,
        manufacturer: productData.manufacturer
      }
    });

    if (existingProduct) {
      // Update existing product to have Class D
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: { class: 'D' }
      });
    } else {
      // Create new product with Class D
      await prisma.product.create({
        data: {
          ...productData,
          class: 'D', // Set new products to Class D
          distributors: [], // Start with empty distributors array
        }
      });
    }
  }

  // Update all existing products to have Class D if they don't have a class
  console.log('🔄 Updating existing products to Class D...');
  const updateResult = await prisma.product.updateMany({
    where: {
      class: null
    },
    data: {
      class: 'D'
    }
  });
  console.log(`📦 Updated ${updateResult.count} existing products to Class D`);

  // Create sample pickup points
  const samplePickupPoints = [
    {
      id: 'pickup-central',
      name: 'Central Warehouse - Gurgaon',
      address: 'Central Warehouse - 123 Industrial Park, Sector 15, Gurgaon, Haryana 122001',
      description: 'Main distribution center with full inventory'
    },
    {
      id: 'pickup-north',
      name: 'North Branch - Delhi',
      address: 'North Branch - 456 Delhi Road, Model Town, Delhi, Delhi 110009',
      description: 'Northern region pickup point'
    },
    {
      id: 'pickup-south',
      name: 'South Depot - Bangalore',
      address: 'South Depot - 789 MG Road, Koramangala, Bangalore, Karnataka 560034',
      description: 'Southern region distribution center'
    },
    {
      id: 'pickup-east',
      name: 'East Hub - Kolkata',
      address: 'East Hub - 321 Salt Lake, Sector V, Kolkata, West Bengal 700091',
      description: 'Eastern region pickup hub'
    },
    {
      id: 'pickup-west',
      name: 'West Terminal - Mumbai',
      address: 'West Terminal - 654 Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      description: 'Western region terminal'
    },
    {
      id: 'pickup-airport',
      name: 'Airport Cargo - Delhi',
      address: 'Airport Cargo - Terminal 3, Indira Gandhi International Airport, New Delhi, Delhi 110037',
      description: 'Airport cargo pickup point'
    },
    {
      id: 'pickup-port',
      name: 'Port Terminal - Mumbai',
      address: 'Port Terminal - Jawaharlal Nehru Port Trust, Nhava Sheva, Navi Mumbai, Maharashtra 400707',
      description: 'Port terminal pickup point'
    },
    {
      id: 'pickup-railway',
      name: 'Railway Station - Delhi',
      address: 'Railway Station - Platform 1, New Delhi Railway Station, Paharganj, New Delhi, Delhi 110055',
      description: 'Railway station pickup point'
    }
  ];

  for (const pickupPointData of samplePickupPoints) {
    await prisma.pickupPoint.upsert({
      where: { id: pickupPointData.id },
      update: {
        name: pickupPointData.name,
        address: pickupPointData.address,
        description: pickupPointData.description,
        isActive: true
      },
      create: {
        ...pickupPointData,
        isActive: true
      }
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created ${marginsData.length} margin classes (A-E)`);
  console.log(`🏥 Created/Updated ${sampleProducts.length} sample products with Class D`);
  console.log(`📍 Created ${samplePickupPoints.length} pickup points`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
