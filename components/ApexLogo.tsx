import React from 'react';

export function ApexLogo({ size = 32 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Apex Billing"><rect width="32" height="32" rx="7" fill="#155EEF"/><path d="M7.5 23.5 15.85 7.5 24.5 23.5h-4.25l-4.38-8.85-4.18 8.85H7.5Z" fill="white"/><path d="M13 19.2h6.3" stroke="#A9C7FF" strokeWidth="2.3" strokeLinecap="round"/><circle cx="23.5" cy="8.5" r="2.3" fill="#78E5B2" stroke="#155EEF" strokeWidth="1.2"/></svg>;
}
