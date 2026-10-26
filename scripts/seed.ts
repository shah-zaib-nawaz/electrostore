import mongoose from 'mongoose';
import { connectToDatabase } from '../src/lib/db';
import { Category } from '../src/server/models/Category';
import { Brand } from '../src/server/models/Brand';
import { Product } from '../src/server/models/Product';
import { Coupon } from '../src/server/models/Coupon';
import { Review } from '../src/server/models/Review';
import { ALL_PRODUCTS } from '../src/data/products';

async function seed() {
  console.log('🌱 Starting ElectroStore AI database seeding (35 Products)...');

  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB.');

    // 1. Clear existing catalog data
    await Promise.all([
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('🧹 Purged existing collections.');

    // 2. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Graphics Cards', slug: 'gpus', image: '/images/collections/gpus.webp', description: 'Flagship GPUs for gaming, rendering, and AI computing.' },
      { name: 'Laptops', slug: 'laptops', image: '/images/collections/laptops.webp', description: 'Next-gen silicon laptops and AI mobile workstations.' },
      { name: 'Gaming Displays', slug: 'monitors', image: '/images/collections/monitors.webp', description: 'QD-OLED, Mini-LED, and high-refresh 4K gaming monitors.' },
      { name: 'Processors', slug: 'cpus', image: '/images/collections/cpus.webp', description: 'High-throughput multi-core desktop CPUs.' },
      { name: 'Audio', slug: 'audio', image: '/images/collections/audio.webp', description: 'Audiophile DACs, noise-canceling headphones, and spatial gear.' },
      { name: 'Accessories', slug: 'accessories', image: '/images/collections/accessories.webp', description: 'Mechanical keyboards, lightweight gaming mice, and cables.' },
    ]);
    const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
    console.log(`✅ Seeded ${categories.length} categories.`);

    // 3. Seed All 23 Flagship Brands
    const brandDefinitions = [
      { name: 'NVIDIA', slug: 'nvidia', website: 'https://nvidia.com' },
      { name: 'Apple', slug: 'apple', website: 'https://apple.com' },
      { name: 'ASUS', slug: 'asus', website: 'https://asus.com' },
      { name: 'AMD', slug: 'amd', website: 'https://amd.com' },
      { name: 'MSI', slug: 'msi', website: 'https://msi.com' },
      { name: 'Intel', slug: 'intel', website: 'https://intel.com' },
      { name: 'Gigabyte', slug: 'gigabyte', website: 'https://gigabyte.com' },
      { name: 'Dell', slug: 'dell', website: 'https://dell.com' },
      { name: 'Lenovo', slug: 'lenovo', website: 'https://lenovo.com' },
      { name: 'Razer', slug: 'razer', website: 'https://razer.com' },
      { name: 'Samsung', slug: 'samsung', website: 'https://samsung.com' },
      { name: 'LG', slug: 'lg', website: 'https://lg.com' },
      { name: 'BenQ', slug: 'benq', website: 'https://benq.com' },
      { name: 'Sony', slug: 'sony', website: 'https://sony.com' },
      { name: 'Sennheiser', slug: 'sennheiser', website: 'https://sennheiser.com' },
      { name: 'Bose', slug: 'bose', website: 'https://bose.com' },
      { name: 'FiiO', slug: 'fiio', website: 'https://fiio.com' },
      { name: 'Shure', slug: 'shure', website: 'https://shure.com' },
      { name: 'Keychron', slug: 'keychron', website: 'https://keychron.com' },
      { name: 'Logitech', slug: 'logitech', website: 'https://logitech.com' },
      { name: 'Corsair', slug: 'corsair', website: 'https://corsair.com' },
      { name: 'Crucial', slug: 'crucial', website: 'https://crucial.com' },
      { name: 'Elgato', slug: 'elgato', website: 'https://elgato.com' },
    ];

    const brands = await Brand.insertMany(brandDefinitions);
    const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b._id]));
    console.log(`✅ Seeded ${brands.length} flagship brands.`);

    // 4. Seed Products with simulated 3072-dimension normalized embeddings for Atlas Vector Search
    const generateEmbedding = () => new Array(3072).fill(0).map(() => (Math.random() - 0.5) * 0.01);

    const productDocs = ALL_PRODUCTS.map((p) => {
      const brandKey = p.brand.toLowerCase();
      const brandId = brandMap[brandKey] || brands[0]._id;
      const categoryId = catMap[p.category] || categories[0]._id;

      const specEntries = Object.entries(p.specs).map(([k, v]) => [k, String(v)]);

      return {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.originalPrice,
        category: categoryId,
        brand: brandId,
        stock: p.stock,
        isFeatured: Boolean(p.isFeatured),
        isActive: true,
        tags: p.tags,
        specifications: Object.fromEntries(specEntries),
        ratings: {
          avg: p.rating,
          count: p.reviewCount,
        },
        images: p.images.map((url, i) => ({
          url,
          publicId: `${p.slug}-${i + 1}`,
          alt: `${p.name} Image ${i + 1}`,
        })),
        embedding: generateEmbedding(),
      };
    });

    const products = await Product.insertMany(productDocs);
    console.log(`✅ Seeded ${products.length} flagship products with 3072-dim embeddings across 6 categories.`);

    // 5. Seed Coupons
    const now = new Date();
    const future = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const coupons = await Coupon.insertMany([
      {
        code: 'ELECTRO10',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true,
        startDate: now,
        endDate: future,
        usageLimit: 1000,
        usedCount: 14,
      },
      {
        code: 'SAVE25',
        discountType: 'fixed',
        discountValue: 25,
        minOrderAmount: 150,
        isActive: true,
        startDate: now,
        endDate: future,
        usageLimit: 500,
        usedCount: 22,
      },
      {
        code: 'VIP100',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 1000,
        isActive: true,
        startDate: now,
        endDate: future,
        usageLimit: 100,
        usedCount: 5,
      },
    ]);
    console.log(`✅ Seeded ${coupons.length} promotional coupons.`);

    console.log('🎉 Seeding successfully completed with 35 realistic products!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
