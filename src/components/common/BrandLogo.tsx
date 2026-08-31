import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import logoAsset from '../../assets/logo.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textColor?: 'dark' | 'light' | 'auto';
  subtitle?: string;
  className?: string;
  logoClassName?: string;
  variant?: 'standard' | 'white-card' | 'dark-card' | 'minimal';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'dark',
  subtitle,
  className = '',
  logoClassName = '',
  variant = 'white-card',
}) => {
  const [imgError, setImgError] = useState(false);

  // Dimensions based on size preset
  const sizeConfig = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      img: 'w-7 h-7',
      title: 'text-sm font-bold',
      sub: 'text-[10px]',
    },
    md: {
      box: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl',
      img: 'w-9 h-9 sm:w-10 sm:h-10',
      title: 'text-base sm:text-lg font-black',
      sub: 'text-xs',
    },
    lg: {
      box: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl',
      img: 'w-12 h-12 sm:w-14 sm:h-14',
      title: 'text-xl sm:text-2xl font-black',
      sub: 'text-xs sm:text-sm',
    },
    xl: {
      box: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl',
      img: 'w-18 h-18 sm:w-22 sm:h-22',
      title: 'text-2xl sm:text-3xl font-black',
      sub: 'text-sm',
    },
    '2xl': {
      box: 'w-28 h-28 sm:w-32 sm:h-32 rounded-3xl',
      img: 'w-24 h-24 sm:w-28 sm:h-28',
      title: 'text-3xl sm:text-4xl font-black',
      sub: 'text-base',
    },
  }[size];

  const variantStyles = {
    'white-card': 'bg-white p-1.5 shadow-sm border border-slate-200/80',
    'dark-card': 'bg-slate-900/90 p-1.5 shadow-md border border-slate-700/80',
    'minimal': 'bg-transparent p-0',
    'standard': 'bg-white/90 backdrop-blur-xs p-1 border border-slate-200',
  }[variant];

  const titleColor =
    textColor === 'light'
      ? 'text-white'
      : textColor === 'dark'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-white';

  const subColor =
    textColor === 'light'
      ? 'text-slate-400'
      : 'text-slate-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Graphic Container */}
      <div
        className={`flex items-center justify-center shrink-0 overflow-hidden ${sizeConfig.box} ${variantStyles} ${logoClassName}`}
      >
        {!imgError ? (
          <img
            src={logoAsset || '/logo.png'}
            alt="Inzu Chafique Properties Agency"
            className={`${sizeConfig.img} object-contain transition-transform duration-300`}
            loading="eager"
            onError={() => {
              // Try fallback to root /logo.png before completely failing to icon
              setImgError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center rounded-lg">
            <Building2 className="w-1/2 h-1/2 text-amber-400" />
          </div>
        )}
      </div>

      {/* Optional Brand Name & Subtitle */}
      {showText && (
        <div className="leading-tight select-none">
          <div className={`${sizeConfig.title} ${titleColor} tracking-tight uppercase flex items-center gap-1.5`}>
            <span className="text-emerald-600 font-extrabold">Inzu</span>
            <span>Chafique</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold hidden sm:inline">Properties</span>
            <span className="text-emerald-600 font-extrabold">Agency</span>
          </div>
          <div className={`${sizeConfig.sub} ${subColor} font-medium tracking-wide flex items-center gap-1`}>
            <span>{subtitle || 'Kigali, Rwanda'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
