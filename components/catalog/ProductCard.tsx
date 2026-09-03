'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
  onOrder: (product: Product) => void;
}

export function ProductCard({ product, index, onOrder }: ProductCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const lowestPrice = Math.min(...product.variants.filter(v => v.active).map(v => v.price));

  return (
    <div
      className="perspective-container animate-fade-in-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div
        className="card-3d group relative rounded-2xl overflow-hidden border border-surface-border bg-surface-light hover:border-nexai-500/40 transition-colors duration-300"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-light/90 via-transparent to-transparent" />

          {/* Variant count badge */}
          <div className="absolute top-3 right-3 bg-nexai-600/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {product.variants.filter(v => v.active).length} varian
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-1.5 tracking-tight">
            {product.name}
          </h3>
          <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Price & CTA */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Mulai dari</p>
              <p className="text-xl font-bold text-nexai-400 tracking-tight">
                {formatRupiah(lowestPrice)}
              </p>
            </div>
            <button
              onClick={() => onOrder(product)}
              className="shrink-0 bg-nexai-600 hover:bg-nexai-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-nexai-600/20 active:scale-95 cursor-pointer"
              aria-label={`Pesan ${product.name}`}
            >
              Pesan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
