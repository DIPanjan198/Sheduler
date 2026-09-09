import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl'
  };

  const svgSizes = {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 34
  };

  const iconDimension = svgSizes[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 border border-white/20 select-none overflow-hidden ${sizeMap[size]} ${className}`}
    >
      {/* Subtle shine highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none" />

      {/* Modern Schedule + Clock Badge SVG Icon */}
      <svg
        width={iconDimension}
        height={iconDimension}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 text-white drop-shadow-xs"
      >
        {/* Calendar Frame */}
        <rect
          x="3"
          y="4"
          width="18"
          height="17"
          rx="3.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Calendar Top Pins */}
        <line x1="8" y1="2" x2="8" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="2" x2="16" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Top Header Line */}
        <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        
        {/* Clock/Shift Circle Accent */}
        <circle cx="14" cy="15" r="4.2" fill="#4f46e5" stroke="white" strokeWidth="1.8" />
        {/* Clock Hands */}
        <path d="M14 13V15.2L15.8 16.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Schedule mini dots */}
        <circle cx="7" cy="13" r="1" fill="currentColor" opacity="0.9" />
        <circle cx="7" cy="16.5" r="1" fill="currentColor" opacity="0.9" />
      </svg>
    </div>
  );
};
