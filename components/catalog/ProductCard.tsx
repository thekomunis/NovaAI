'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Sparkles, ShoppingBag, Zap } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
  onOrder: (product: Product) => void;
}

export function ProductCard({ product, index, onOrder }: ProductCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, shadowX: 0, shadowY: 0, shineX: 50, shineY: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: y * -12,
      y: x * 12,
      shadowX: x * -15,
      shadowY: y * -15,
      shineX: ((e.clientX - rect.left) / rect.width) * 100,
      shineY: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, shadowX: 0, shadowY: 0, shineX: 50, shineY: 50 });
  }, []);

  const activeVariants = product.variants.filter(v => v.active);
  const lowestPrice = Math.min(...activeVariants.map(v => v.price));

  return (
    <div
      className="perspective-1000 animate-fade-in-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div
        className="group relative rounded-3xl overflow-hidden border border-white/10 bg-[#0f131f]/90 hover:border-cyan-500/50 transition-all duration-300 shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-cyan-500/20"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dynamic Glass Reflection Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
          style={{
            background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
          }}
        />

        {/* Product Image Banner */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#07090e]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f131f] via-transparent to-black/30" />

          {/* Glowing Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
            <Zap className="w-3 h-3 text-cyan-400 fill-current" />
            <span>Garansi 100%</span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
            <span>{activeVariants.length} Varian</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight">
              {product.name}
            </h3>
            <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <p className="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed h-9">
            {product.description}
          </p>

          {/* Pricing & Order CTA */}
          <div className="flex items-end justify-between gap-3 pt-4 border-t border-white/10">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-0.5">Mulai Dari</p>
              <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 tracking-tight">
                {formatRupiah(lowestPrice)}
              </p>
            </div>
            <button
              onClick={() => onOrder(product)}
              className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label={`Pesan ${product.name}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Beli Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
