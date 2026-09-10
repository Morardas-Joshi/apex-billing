import React from 'react';

export function ApexLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EasyInvoice Logo"
    >
      <defs>
        <linearGradient id="easy_logo_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="logo_shadow" x="0" y="2" width="40" height="40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Rounded Container */}
      <rect width="40" height="40" rx="12" fill="url(#easy_logo_grad)" />

      {/* Stylized Calculator / Invoice Vector Symbol */}
      <rect x="10" y="9" width="20" height="22" rx="4" fill="white" fillOpacity="0.95" />
      <rect x="13" y="12" width="14" height="4" rx="1.5" fill="#2563EB" />

      {/* Calculator Button Grid */}
      <circle cx="14.5" cy="20" r="1.5" fill="#1D4ED8" />
      <circle cx="20" cy="20" r="1.5" fill="#1D4ED8" />
      <circle cx="25.5" cy="20" r="1.5" fill="#1D4ED8" />

      <circle cx="14.5" cy="25" r="1.5" fill="#1D4ED8" />
      <circle cx="20" cy="25" r="1.5" fill="#1D4ED8" />
      <rect x="24" y="23.5" width="3" height="3" rx="1" fill="#10B981" />

      {/* Green Active Dot */}
      <circle cx="32" cy="8" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}
