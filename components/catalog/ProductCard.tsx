'use client';

import { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { ShoppingBag, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
  onOrder: (product: Product) => void;
}

export function ProductCard({ product, index, onOrder }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // Max 12deg tilt X
    const rotateY = ((x - centerX) / centerX) * 12;  // Max 12deg tilt Y

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`);
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition({ x: 50, y: 50, opacity: 0 });
  };

  const activeVariants = product.variants.filter(v => v.active);
  const lowestPrice = Math.min(...activeVariants.map(v => v.price));

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col justify-between overflow-hidden p-6 rounded-3xl bg-[#0e121e]/85 backdrop-blur-2xl border border-white/10 hover:border-cyan-400/50 shadow-2xl transition-all duration-200 ease-out cursor-pointer group"
      style={{
        transform: transformStyle,
        transformStyle: 'preserve-3d',
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Specular Light Reflection Spot (Dribbble Glare Effect) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.25) 0%, transparent 60%)`,
          opacity: glarePosition.opacity,
        }}
      />

      {/* Border Beam Gradient Glow */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      {/* Floating 3D Layer Content */}
      <div style={{ transform: 'translateZ(35px)', transformStyle: 'preserve-3d' }}>
        {/* Top Header Row with Official Brand Icon */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            {product.icon ? (
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/10 border border-white/15 p-1.5 shadow-xl group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-300">
                <Image
                  src={product.icon}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-xl">
                {product.name[0]}
              </div>
            )}

            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Full Garansi 100%</span>
              </div>
            </div>
          </div>

          <span className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
            {activeVariants.length} Varian
          </span>
        </div>

        {/* Product Cover Image */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-2xl group-hover:border-white/20 transition-all">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-108 transition-transform duration-700"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e121e] via-transparent to-transparent opacity-70" />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Floating 3D Action Footer */}
      <div
        className="pt-4 border-t border-white/10 flex items-center justify-between gap-3"
        style={{ transform: 'translateZ(45px)' }}
      >
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Harga Mulai</span>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300">
            {formatRupiah(lowestPrice)}
          </span>
        </div>

        <button
          onClick={() => onOrder(product)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-cyan-500/50 transition-all cursor-pointer active:scale-95 group-hover:scale-105"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Beli Sekarang</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
