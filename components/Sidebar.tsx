'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calculator,
  ShoppingCart,
  Receipt,
  FileMinus,
  Database,
  Users,
  Package,
  Truck,
  CreditCard,
  Wallet,
  ArrowDownLeft,
  ShieldCheck,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Settings,
  Building,
  FileCheck,
  Hash,
  Palette,
  HelpCircle,
  BookOpen,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Calendar,
  MapPin,
  Percent,
  Sliders,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: ShoppingCart,
    items: [
      { name: 'Sales Orders', href: '/dashboard/sales-orders', icon: ShoppingCart },
      { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
      { name: 'Credit Notes', href: '/dashboard/credit-notes', icon: FileMinus },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    icon: Database,
    items: [
      { name: 'Customers', href: '/dashboard/customers', icon: Users },
      { name: 'Items & Products', href: '/dashboard/items', icon: Package },
      { name: 'Vendors', href: '/dashboard/vendors', icon: Truck },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    items: [
      { name: 'Payments Received', href: '/dashboard/payments', icon: ArrowDownLeft },
      { name: 'Payment Modes', href: '/dashboard/payment-modes', icon: Wallet },
    ],
  },
  {
    id: 'gst',
    label: 'GST',
    icon: ShieldCheck,
    items: [
      { name: 'GST Configuration', href: '/settings/gst', icon: ShieldCheck },
      { name: 'GSTR-1 Return', href: '/dashboard/gst/gstr1', icon: FileSpreadsheet },
      { name: 'GSTR-3B Return', href: '/dashboard/gst/gstr3b', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: PieChart,
    items: [
      { name: 'Sales Summary', href: '/dashboard/reports/sales', icon: TrendingUp },
      { name: 'GST Tax Summary', href: '/dashboard/reports/gst', icon: Receipt },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { name: 'Overview', href: '/settings', icon: LayoutDashboard },
      { name: 'Company Identity', href: '/settings/company', icon: Building },
      { name: 'GST Configuration', href: '/settings/gst', icon: ShieldCheck },
      { name: 'Payment Terms', href: '/settings/payment-terms', icon: FileCheck },
      { name: 'Numbering & Sequences', href: '/settings/numbering', icon: Hash },
      { name: 'Document Templates', href: '/settings/templates', icon: Palette },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    items: [
      { name: 'User Manual', href: '/dashboard/help/manual', icon: BookOpen },
      { name: 'Support & FAQ', href: '/dashboard/help/support', icon: MessageCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Accordion state: keep groups open if an item within it is active by default
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    sales: true,
    settings: true,
    masters: false,
    payments: false,
    gst: false,
    reports: false,
    help: false,
    dashboard: false,
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Automatically open group if pathname matches
    menuGroups.forEach((group) => {
      const hasActive = group.items.some(
        (item) => pathname === item.href || (item.href !== '/dashboard' && item.href !== '/settings' && pathname?.startsWith(item.href))
      );
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

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
    <aside className={`easy-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="easy-brand-header">
        <div className="brand-icon-box">
          <Calculator size={20} className="text-white" />
        </div>
        {!isCollapsed && (
          <div className="brand-text-box">
            <h1 className="brand-name">EasyInvoice</h1>
            <p className="brand-tagline">Indian Bill & Sales Management</p>
          </div>
        )}
      </div>

      {/* Navigation Accordion List */}
      <div className="easy-nav-container">
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = !!openGroups[group.id];
          const isGroupActive = group.items.some(
            (item) => pathname === item.href || (item.href !== '/dashboard' && item.href !== '/settings' && pathname?.startsWith(item.href))
          );

          // If group only has 1 item and no dropdown needed (e.g. Dashboard)
          if (group.items.length === 1 && group.id === 'dashboard') {
            const item = group.items[0];
            const isActive = pathname === item.href;
            return (
              <div key={group.id} className="nav-group-wrapper">
                <Link
                  href={item.href}
                  className={`easy-nav-accordion-header ${isActive ? 'active-header' : ''}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon size={18} className="nav-icon" />
                    {!isCollapsed && <span className="nav-label-text">{item.name}</span>}
                  </div>
                </Link>
              </div>
            );
          }

          return (
            <div key={group.id} className="nav-group-wrapper">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`easy-nav-accordion-header ${isGroupActive ? 'active-group-header' : ''}`}
                title={isCollapsed ? group.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <GroupIcon size={18} className="nav-icon" />
                  {!isCollapsed && <span className="nav-label-text">{group.label}</span>}
                </div>
                {!isCollapsed && (
                  <span className="chevron-icon">
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                )}
              </button>

              {/* Submenu Dropdown List */}
              {isOpen && !isCollapsed && (
                <div className="easy-nav-submenu-list">
                  <div className="submenu-guide-line" />
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && item.href !== '/settings' && pathname?.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`easy-nav-sublink ${isActive ? 'sublink-active' : ''}`}
                      >
                        <ItemIcon size={15} className="sublink-icon" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse Sidebar Footer Toggle */}
      <div className="easy-sidebar-footer">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapse-sidebar-btn"
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
