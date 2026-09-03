'use client';

import Image from 'next/image';
import { ShoppingBag, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
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
      className="card-3d group relative flex flex-col justify-between overflow-hidden p-6 text-left"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

      <div>
        {/* Top Header Row with Official Brand Icon & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            {product.icon ? (
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-1.5 shadow-lg group-hover:scale-110 group-hover:border-indigo-500/50 transition-all duration-300">
                <Image
                  src={product.icon}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                {product.name[0]}
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Full Garansi 100%</span>
              </div>
            </div>
          </div>

          <span className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {activeVariants.length} Varian
          </span>
        </div>

        {/* Product Image Cover */}
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-white/10 shadow-inner group-hover:border-white/20 transition-all">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f131f] via-transparent to-transparent opacity-60" />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Harga Mulai</span>
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
            {formatRupiah(lowestPrice)}
          </span>
        </div>

        <button
          onClick={() => onOrder(product)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 group-hover:shadow-cyan-500/30"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Beli Sekarang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
