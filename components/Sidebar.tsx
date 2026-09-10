'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  Sparkles,
} from 'lucide-react';
import { ApexLogo } from './ApexLogo';

const groups = [
  [
    'WORKSPACE',
    [
      ['Overview', '/dashboard', LayoutDashboard],
      ['Invoices', '/dashboard/invoices', FileText],
      ['Customers', '/dashboard/customers', Users],
      ['Payments', '/dashboard/payments', CreditCard],
    ],
  ],
  [
    'MANAGE',
    [
      ['Settings', '#', Settings],
    ],
  ],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <ApexLogo size={32} />
        <div>
          <b className="brand-title">APEX BILLING</b>
          <small className="brand-subtitle">GST ENTERPRISE V1.0</small>
        </div>
      </div>

      {/* Navigation Links List (Scrollable area) */}
      <div className="nav-container">
        {groups.map(([label, items]) => (
          <section key={label} className="nav-section">
            <p className="nav-label">{label}</p>
            {items.map(([name, href, Icon]) => {
              const isActive =
                href !== '#' &&
                (pathname === href || (href !== '/dashboard' && pathname?.startsWith(href)));
              return (
                <Link
                  key={name}
                  href={href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{name}</span>
                  {isActive && <em className="active-indicator" />}
                </Link>
              );
            })}
          </section>
        ))}
      </div>

      {/* Footer Profile & Logout Frame (Always visible, non-clipped) */}
      <div className="sidebar-footer">
        <div className="profile-card">
          <div className="avatar">AD</div>
          <div className="user-info">
            <b className="user-name">Admin User</b>
            <small className="user-role">admin@billing.com</small>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="logout-btn"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
