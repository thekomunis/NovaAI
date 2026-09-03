'use client';

import Image from 'next/image';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
  onOrder: (product: Product) => void;
}

export function ProductCard({ product, index, onOrder }: ProductCardProps) {
  const activeVariants = product.variants.filter(v => v.active);
  const lowestPrice = Math.min(...activeVariants.map(v => v.price));

  return (
    <div
      className="animate-fade-in group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="premium-card overflow-hidden flex flex-col h-full border border-white/10 bg-[#11131a] rounded-2xl">
        {/* Product Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#090a0f]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Garansi 100%</span>
          </div>

          <div className="absolute top-3 right-3 bg-indigo-600/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            {activeVariants.length} Varian
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
              {product.description}
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Mulai Dari</span>
              <span className="text-lg font-bold text-white tracking-tight">
                {formatRupiah(lowestPrice)}
              </span>
            </div>

            <button
              onClick={() => onOrder(product)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-indigo-600/20"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Beli</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
