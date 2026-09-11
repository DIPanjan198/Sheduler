import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Show text wordmark beside the icon */
  withWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  withWordmark = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl', svg: 18, text: 'text-sm', gap: 'gap-2' },
    md: { box: 'w-10 h-10 rounded-2xl', svg: 22, text: 'text-base', gap: 'gap-2.5' },
    lg: { box: 'w-12 h-12 rounded-2xl', svg: 26, text: 'text-lg', gap: 'gap-3' },
    xl: { box: 'w-16 h-16 rounded-3xl', svg: 34, text: 'text-xl', gap: 'gap-3.5' },
  };

  const { box, svg: svgSize, text, gap } = sizeMap[size];

  const icon = imgError ? (
    // Fallback SVG when image can't load
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 text-white drop-shadow-xs"
    >
      <rect x="3" y="4" width="18" height="17" rx="3.5"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="2" x2="8" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="14" cy="15" r="4.2" fill="#4f46e5" stroke="white" strokeWidth="1.8" />
      <path d="M14 13V15.2L15.8 16.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="13" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="7" cy="16.5" r="1" fill="currentColor" opacity="0.9" />
    </svg>
  ) : (
    <img
      src="/logo.jpg"
      alt="ShiftSync Logo"
      className="w-full h-full object-cover rounded-inherit"
      style={{ borderRadius: 'inherit' }}
      onError={() => setImgError(true)}
    />
  );

  const logoBox = (
    <div
      className={`relative inline-flex items-center justify-center select-none overflow-hidden flex-shrink-0
        ${imgError
          ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 border border-white/20'
          : 'shadow-lg shadow-indigo-500/30 ring-2 ring-white/20'
        }
        ${box} ${className}`}
    >
      {imgError && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none" />
      )}
      {icon}
    </div>
  );

  if (!withWordmark) return logoBox;

  return (
    <div className={`inline-flex items-center ${gap}`}>
      {logoBox}
      <div>
        <span
          className={`font-extrabold tracking-tight leading-none block
            bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
            bg-clip-text text-transparent ${text}`}
        >
          ShiftSync
        </span>
        {size === 'lg' || size === 'xl' ? (
          <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase block mt-0.5">
            Workforce Scheduler
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Logo;
