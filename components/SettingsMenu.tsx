'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  Calendar,
  ShieldCheck,
  MapPin,
  Percent,
  Hash,
  Receipt,
  Sliders,
  Palette,
} from 'lucide-react';

interface SettingsMenuProps {
  activeKey?: string;
}

const settingsLinks = [
  { key: 'overview', name: 'Overview', href: '/settings', icon: LayoutDashboard },
  { key: 'company', name: 'Company Identity', href: '/settings/company', icon: Building },
  { key: 'financial-year', name: 'Financial Year', href: '/settings/financial-year', icon: Calendar },
  { key: 'gst', name: 'GST Configuration', href: '/settings/gst', icon: ShieldCheck },
  { key: 'states', name: 'States & UTs Master', href: '/settings/states', icon: MapPin },
  { key: 'tax', name: 'Tax Master', href: '/settings/tax', icon: Percent },
  { key: 'numbering', name: 'Numbering & Sequences', href: '/settings/numbering', icon: Hash },
  { key: 'payment-terms', name: 'Payment Terms', href: '/settings/payment-terms', icon: Receipt },
  { key: 'templates', name: 'Document Templates', href: '/settings/templates', icon: Palette },
  { key: 'general', name: 'General System', href: '/settings/general', icon: Sliders },
];

export function SettingsMenu({ activeKey }: SettingsMenuProps) {
  const pathname = usePathname();

  return (
    <div className="settings-menu-card">
      <p className="settings-menu-heading">Settings Menu</p>
      <div className="flex flex-col gap-1">
        {settingsLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            activeKey === link.key ||
            (link.key === 'overview' ? pathname === '/settings' : pathname?.startsWith(link.href));

          return (
            <Link
              key={link.key}
              href={link.href}
              prefetch={true}
              className={`settings-menu-link ${isActive ? 'active-settings-link' : ''}`}
            >
              <Icon size={16} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
