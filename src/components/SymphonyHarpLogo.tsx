import React from 'react';
import symphonyHarpEmblemImg from '../assets/images/symphony_harp_logo_1794639103234.jpg';

export { symphonyHarpEmblemImg };

interface SymphonyHarpLogoProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'vector';
}

/**
 * Symphony Markets Official Logo:
 * A crypto-medallion crest featuring a golden Symphony Harp whose vertical
 * strings are glowing emerald & cyan market candlesticks (with wicks and bodies)
 * and golden musical notes floating upward from the harmonic curve.
 */
export const SymphonyHarpLogo: React.FC<SymphonyHarpLogoProps> = ({
  className = 'w-9 h-9',
  size,
  variant = 'vector',
}) => {
  if (variant === 'emblem') {
    return (
      <img
        src={symphonyHarpEmblemImg}
        alt="Symphony Markets Logo — Golden harp with candlestick strings and floating musical notes"
        width={size}
        height={size}
        className={`rounded-full object-cover border border-amber-400/70 shadow-sm shrink-0 select-none ${className}`}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Symphony Markets Logo — Golden harp with candlestick strings and floating musical notes"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        <linearGradient
          id="symphonyCoinBg"
          x1="6"
          y1="6"
          x2="58"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#071936" />
          <stop offset="100%" stopColor="#0F294A" />
        </linearGradient>
        <linearGradient
          id="symphonyGold"
          x1="8"
          y1="8"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Crypto Medallion Outer Double-Ring Crest */}
      <circle
        cx="32"
        cy="32"
        r="29.5"
        fill="url(#symphonyCoinBg)"
        stroke="url(#symphonyGold)"
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="32"
        r="26.2"
        stroke="url(#symphonyGold)"
        strokeOpacity="0.55"
        strokeWidth="0.9"
      />

      {/* HARP STRINGS AS GLOWING MARKET CANDLESTICKS (Wicks + Candle Bodies) */}
      {/* String 1: Emerald Candlestick */}
      <line x1="21.5" y1="20" x2="21.5" y2="47.5" stroke="#10B981" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="19.8" y="32" width="3.4" height="8.5" rx="0.8" fill="#10B981" stroke="#6EE7B7" strokeWidth="0.5" />

      {/* String 2: Sky-Cyan Candlestick */}
      <line x1="26" y1="21.5" x2="26" y2="47.5" stroke="#38BDF8" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="24.3" y="29" width="3.4" height="9" rx="0.8" fill="#0EA5E9" stroke="#7DD3FC" strokeWidth="0.5" />

      {/* String 3: Emerald Breakout Candlestick */}
      <line x1="30.5" y1="24" x2="30.5" y2="47.5" stroke="#34D399" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="28.8" y="27" width="3.4" height="8.5" rx="0.8" fill="#10B981" stroke="#A7F3D0" strokeWidth="0.5" />

      {/* String 4: Sky-Cyan Continuation Candlestick */}
      <line x1="35" y1="27.5" x2="35" y2="45" stroke="#38BDF8" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="33.3" y="30" width="3.4" height="7" rx="0.8" fill="#0EA5E9" stroke="#7DD3FC" strokeWidth="0.5" />

      {/* String 5: Upper Harmonic Emerald Candlestick */}
      <line x1="39.5" y1="26.5" x2="39.5" y2="39" stroke="#34D399" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="37.9" y="28.5" width="3.2" height="5.5" rx="0.8" fill="#10B981" stroke="#6EE7B7" strokeWidth="0.5" />

      {/* SYMPHONY HARP GOLDEN CLASSICAL FRAME */}
      {/* Classical Fluted Column Pillar (Left) */}
      <path
        d="M16.5 18V47.5"
        stroke="url(#symphonyGold)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Column Capital & Base Rings */}
      <rect x="14.2" y="16.2" width="4.8" height="2.2" rx="0.8" fill="url(#symphonyGold)" />
      <rect x="14.5" y="24.5" width="4.2" height="1.6" rx="0.6" fill="url(#symphonyGold)" />
      <rect x="14.5" y="41.5" width="4.2" height="1.6" rx="0.6" fill="url(#symphonyGold)" />

      {/* Harmonic S-Curve Neck (Double Gold Contour) */}
      <path
        d="M18 18C24.5 17.5 28 24 34 26.2C38.2 27.6 41.5 23.5 44.5 24.8C46.4 25.6 46.6 28 45.2 30.5L34.5 47.5"
        stroke="url(#symphonyGold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Soundboard Diagonal Line */}
      <path
        d="M31.5 47.5L43 29"
        stroke="url(#symphonyGold)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Stepped Harp Pedestal Base */}
      <path
        d="M13.5 48H37.5"
        stroke="url(#symphonyGold)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M12.5 50.2H38.5"
        stroke="url(#symphonyGold)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* FLOATING GOLDEN MUSICAL NOTES RISING FROM THE HARP */}
      {/* Note 1: Golden Eighth Note (♪) */}
      <g transform="translate(31, 11.5)">
        <ellipse
          cx="2.4"
          cy="7.2"
          rx="2.1"
          ry="1.5"
          transform="rotate(-20 2.4 7.2)"
          fill="#FDE68A"
        />
        <path
          d="M4.1 6.8V1.2C5.9 1.8 7 3.1 6.7 4.9"
          stroke="#FDE68A"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Note 2: Beamed Sixteenth Notes (♫) */}
      <g transform="translate(36.5, 16)">
        <ellipse
          cx="2"
          cy="6.8"
          rx="1.9"
          ry="1.4"
          transform="rotate(-20 2 6.8)"
          fill="#FBBF24"
        />
        <path
          d="M3.6 6.4V1.5L8 0.6V5.5"
          stroke="#FDE68A"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse
          cx="6.4"
          cy="5.9"
          rx="1.9"
          ry="1.4"
          transform="rotate(-20 6.4 5.9)"
          fill="#FBBF24"
        />
      </g>

      {/* Note 3: High Floating Golden Eighth Note (♪) */}
      <g transform="translate(42.5, 10.5)">
        <ellipse
          cx="2.2"
          cy="6.5"
          rx="1.9"
          ry="1.4"
          transform="rotate(-20 2.2 6.5)"
          fill="#FDE68A"
        />
        <path
          d="M3.8 6.1V1C5.4 1.6 6.4 2.7 6.1 4.3"
          stroke="#FDE68A"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
