'use client';

import { useState } from 'react';
import { products } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/catalog/ProductCard';
import { OrderModal } from '@/components/order/OrderModal';

export function ProductCatalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            index={index}
            onOrder={setSelectedProduct}
          />
        ))}
      </div>

      <OrderModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
