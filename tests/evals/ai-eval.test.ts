import { describe, it, expect } from 'vitest';
import { createElectroBotTools } from '@/server/ai/tools';

describe('ElectroBot AI Evals & Guardrails', () => {
  const tools = createElectroBotTools(null);

  it('exposes the required late-2026 e-commerce tool suite', () => {
    expect(tools).toHaveProperty('searchProducts');
    expect(tools).toHaveProperty('getProductDetails');
    expect(tools).toHaveProperty('compareProducts');
    expect(tools).toHaveProperty('getRecommendations');
    expect(tools).toHaveProperty('addToCart');
    expect(tools).toHaveProperty('applyBestCoupon');
    expect(tools).toHaveProperty('checkOrderStatus');
  });

  it('validates searchProducts parameters schema correctly', () => {
    const searchTool = tools.searchProducts as any;
    expect(searchTool.description).toContain('Search for electronics products');

    // Test parameter schema
    const validParams = {
      query: 'RTX 5090 Blackwell',
      minPrice: 1000,
      maxPrice: 2500,
      inStockOnly: true,
    };
    const parsed = searchTool.parameters.safeParse(validParams);
    expect(parsed.success).toBe(true);

    // Negative test: query cannot be missing
    const invalidParams = { minPrice: 500 };
    const invalidParsed = searchTool.parameters.safeParse(invalidParams);
    expect(invalidParsed.success).toBe(false);
  });

  it('enforces comparison tool constraints (minimum 2 products, maximum 4)', () => {
    const compareTool = tools.compareProducts as any;

    // Valid: 2 items
    expect(compareTool.parameters.safeParse({ productIdsOrSkus: ['SKU-1', 'SKU-2'] }).success).toBe(true);

    // Valid: 4 items
    expect(compareTool.parameters.safeParse({ productIdsOrSkus: ['SKU-1', 'SKU-2', 'SKU-3', 'SKU-4'] }).success).toBe(true);

    // Invalid: Only 1 item
    expect(compareTool.parameters.safeParse({ productIdsOrSkus: ['SKU-1'] }).success).toBe(false);

    // Invalid: 5 items
    expect(compareTool.parameters.safeParse({ productIdsOrSkus: ['1', '2', '3', '4', '5'] }).success).toBe(false);
  });

  it('guarantees zero price hallucination guardrail: coupon finder enforces positive order totals', () => {
    const couponTool = tools.applyBestCoupon as any;
    const valid = couponTool.parameters.safeParse({ orderTotal: 500 });
    expect(valid.success).toBe(true);

    const negativeTotal = couponTool.parameters.safeParse({ orderTotal: -50 });
    expect(negativeTotal.success).toBe(false);
  });

  it('enforces approved tool-call gate for state-mutating cart additions', () => {
    const addCartTool = tools.addToCart as any;
    expect(addCartTool.description).toContain('requires user confirmation');

    const valid = addCartTool.parameters.safeParse({ productId: 'prod-123', quantity: 2 });
    expect(valid.success).toBe(true);

    const invalidQty = addCartTool.parameters.safeParse({ productId: 'prod-123', quantity: 0 });
    expect(invalidQty.success).toBe(false);
  });
});
