'use client';

interface Loader3DProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loader3D({ size = 'md', text }: Loader3DProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Outer 3D Orbiting Ring 1 */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-indigo-500 animate-spin" />
        
        {/* Inner 3D Counter-Orbiting Ring 2 */}
        <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-purple-500 border-l-pink-500 animate-[spin_1.5s_linear_infinite_reverse]" />
        
        {/* Glowing 3D Pulse Core */}
        <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 animate-ping shadow-[0_0_15px_#06b6d4]" />
      </div>

      {text && (
        <p className="text-xs font-bold tracking-wider text-cyan-300 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
