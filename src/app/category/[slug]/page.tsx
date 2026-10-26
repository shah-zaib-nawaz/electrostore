import React from 'react';
import ProductsPage from '@/app/products/page';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    minRating?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <ProductsPage
      searchParams={Promise.resolve({
        ...resolvedSearchParams,
        category: slug,
      })}
    />
  );
}
