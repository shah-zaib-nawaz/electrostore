import { tool } from 'ai';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/server/models/Product';
import { Coupon } from '@/server/models/Coupon';
import { Order } from '@/server/models/Order';
import { hybridProductSearch } from '@/server/search/hybrid-search';
import type { AuthSession } from '@/server/auth-guard';

export function createElectroBotTools(session?: AuthSession | null) {
  return {
    // 1. Discovery Tool: Search Products via Hybrid $rankFusion
    searchProducts: tool({
      description: 'Search for electronics products using natural language queries, semantic intent, or exact SKU.',
      parameters: z.object({
        query: z.string().describe('Search query such as "OLED 240Hz monitor" or "RTX 5080"'),
        minPrice: z.number().optional().describe('Minimum budget in USD'),
        maxPrice: z.number().optional().describe('Maximum budget in USD'),
        inStockOnly: z.boolean().default(true).describe('Filter to in-stock items only'),
      }),
      execute: async ({
        query,
        minPrice,
        maxPrice,
        inStockOnly,
      }: {
        query: string;
        minPrice?: number;
        maxPrice?: number;
        inStockOnly: boolean;
      }) => {
        const searchRes = await hybridProductSearch({
          query,
          minPrice,
          maxPrice,
          inStockOnly,
          limit: 6,
        });

        return {
          resultsCount: searchRes.count,
          products: searchRes.results.map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            price: p.price,
            stock: p.stock,
            image: p.images?.[0]?.url,
            rating: p.ratings?.avg || 0,
            shortDescription: p.shortDescription || p.description?.slice(0, 120),
          })),
        };
      },
    } as any),

    // 2. Product Detail & Specifications
    getProductDetails: tool({
      description: 'Get deep technical specifications, live stock availability, and verified customer ratings for a product.',
      parameters: z.object({
        slugOrSku: z.string().describe('The product slug or SKU'),
      }),
      execute: async ({ slugOrSku }: { slugOrSku: string }) => {
        await connectToDatabase();
        const product = await Product.findOne({
          $or: [{ slug: slugOrSku.toLowerCase() }, { sku: slugOrSku.toUpperCase() }],
          isActive: true,
        }).populate('category brand');

        if (!product) {
          return { found: false, error: 'Product not found' };
        }

        const specsObj = product.specifications instanceof Map
          ? Object.fromEntries(product.specifications)
          : product.specifications || {};

        return {
          found: true,
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          inStock: product.stock > 0,
          category: (product.category as any)?.name,
          brand: (product.brand as any)?.name,
          specifications: specsObj,
          ratings: product.ratings,
          images: product.images.map((img: any) => img.url),
        };
      },
    } as any),

    // 3. Multi-Product Comparison Matrix
    compareProducts: tool({
      description: 'Compare 2 to 4 products side-by-side across technical specifications, pricing, and value.',
      parameters: z.object({
        productIdsOrSkus: z.array(z.string()).min(2).max(4).describe('Array of 2 to 4 product IDs or SKUs to compare'),
      }),
      execute: async ({ productIdsOrSkus }: { productIdsOrSkus: string[] }) => {
        await connectToDatabase();
        const products = await Product.find({
          $or: [
            { _id: { $in: productIdsOrSkus.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id)) } },
            { sku: { $in: productIdsOrSkus.map((s: string) => s.toUpperCase()) } },
            { slug: { $in: productIdsOrSkus.map((s: string) => s.toLowerCase()) } },
          ],
        });

        if (products.length < 2) {
          return { error: 'At least 2 valid products are required for comparison' };
        }

        // Collect all distinct specification keys
        const allSpecKeys = new Set<string>();
        const normalized = products.map((p: any) => {
          const specs = p.specifications instanceof Map ? Object.fromEntries(p.specifications) : (p.specifications || {});
          Object.keys(specs).forEach((k) => allSpecKeys.add(k));
          return {
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            specs,
            rating: p.ratings?.avg || 0,
          };
        });

        return {
          comparedProducts: normalized,
          specificationKeys: Array.from(allSpecKeys),
        };
      },
    } as any),

    // 4. Recommendation by Use-Case and Budget
    getRecommendations: tool({
      description: 'Find best recommended electronics for a specific use-case within budget.',
      parameters: z.object({
        useCase: z.string().describe('The intended workload or scenario'),
        budgetCap: z.number().optional().describe('Maximum budget cap in USD'),
      }),
      execute: async ({ useCase, budgetCap }: { useCase: string; budgetCap?: number }) => {
        const query = `${useCase} high performance electronics`;
        const res = await hybridProductSearch({
          query,
          maxPrice: budgetCap,
          inStockOnly: true,
          limit: 4,
        });

        return {
          useCase,
          recommendations: res.results.map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            price: p.price,
            matchHighlights: p.shortDescription || p.name,
          })),
        };
      },
    } as any),

    // 5. State-Mutating Tool: Add to Cart (Approved Tool Gate)
    addToCart: tool({
      description: 'Add an item to the shopping cart. This requires user confirmation before execution.',
      parameters: z.object({
        productId: z.string().describe('Product ObjectId or SKU to add'),
        quantity: z.number().int().min(1).default(1).describe('Quantity of item'),
      }),
      execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
        await connectToDatabase();
        const product = await Product.findOne({
          $or: [{ _id: /^[0-9a-fA-F]{24}$/.test(productId) ? productId : null }, { sku: productId.toUpperCase() }],
        });

        if (!product) {
          return { success: false, error: 'Product not found' };
        }

        if (product.stock < quantity) {
          return {
            success: false,
            error: `Insufficient stock. Only ${product.stock} units available.`,
          };
        }

        return {
          success: true,
          actionRequired: 'APPROVE_ADD_TO_CART',
          item: {
            productId: product._id.toString(),
            name: product.name,
            price: product.price,
            quantity,
            totalPrice: product.price * quantity,
          },
        };
      },
    } as any),

    // 6. Coupon Finder & Applicability Tool
    applyBestCoupon: tool({
      description: 'Check and apply the best available coupon for a given order amount.',
      parameters: z.object({
        orderTotal: z.number().positive(),
      }),
      execute: async ({ orderTotal }: { orderTotal: number }) => {
        await connectToDatabase();
        const now = new Date();
        const activeCoupons = await Coupon.find({
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
          minOrderAmount: { $lte: orderTotal },
        });

        if (activeCoupons.length === 0) {
          return { found: false, message: 'No active coupons eligible for this cart total.' };
        }

        let best = activeCoupons[0];
        let maxSaving = 0;

        for (const c of activeCoupons) {
          let saving = c.discountType === 'percentage'
            ? (orderTotal * c.discountValue) / 100
            : c.discountValue;
          if (c.maxDiscount && saving > c.maxDiscount) {
            saving = c.maxDiscount;
          }
          if (saving > maxSaving) {
            maxSaving = saving;
            best = c;
          }
        }

        return {
          found: true,
          code: best.code,
          estimatedSavings: maxSaving,
          discountType: best.discountType,
          discountValue: best.discountValue,
        };
      },
    } as any),

    // 7. Auth-Gated Order Status
    checkOrderStatus: tool({
      description: 'Check the real-time status and tracking information of a customer order.',
      parameters: z.object({
        orderId: z.string().describe('The order ID to look up'),
      }),
      execute: async ({ orderId }: { orderId: string }) => {
        if (!session?.user?.id) {
          return {
            authenticated: false,
            message: 'You must be signed in to check order status.',
          };
        }

        await connectToDatabase();
        const order = await Order.findOne({
          _id: orderId,
          user: session.user.id,
        });

        if (!order) {
          return { found: false, message: 'Order not found under your account.' };
        }

        return {
          found: true,
          orderId: order._id.toString(),
          status: order.status,
          total: order.total,
          carrier: order.carrier || 'Standard Freight',
          trackingNumber: order.trackingNumber || 'Pending pickup',
          itemsCount: order.items.length,
        };
      },
    } as any),
  };
}
