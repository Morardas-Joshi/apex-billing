'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Command,
  HelpCircle,
  X,
  ChevronDown,
  User,
  LogOut,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export function Navbar({
  title = 'Settings',
  onSearchChange,
  searchValue = '',
}: NavbarProps) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <>
      <header className="easy-topbar">
        {/* Left Page Title */}
        <div className="topbar-title-box">
          <h1 className="topbar-title">{title}</h1>
        </div>

        {/* Global Search Bar */}
        <div
          className="command-search"
          onClick={() => !onSearchChange && setPaletteOpen(true)}
        >
          <Search size={16} />
          <input
            aria-label="Search records"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={
              onSearchChange
                ? 'Search records...'
                : 'Search invoices, customers, payments...'
            }
          />
          <kbd>
            <Command size={11} /> K
          </kbd>
        </div>

        {/* Right Actions */}
        <div className="topbar-right-actions">
          {/* Notification Bell */}
          <button
            type="button"
            className="topbar-icon-btn"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notification-dot" />
          </button>

          {/* Admin User Profile Dropdown Box */}
          <div className="user-dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="topbar-user-btn"
            >
              <div className="user-avatar-badge">A</div>
              <div className="topbar-user-text">
                <span className="topbar-user-name">Admin</span>
                <span className="topbar-user-email">admin@jashapparels.com</span>
              </div>
              <ChevronDown size={14} className="user-chevron" />
            </button>

            {/* Dropdown Menu Frame */}
            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header-info">
                  <p className="dropdown-user-name">Admin User</p>
                  <p className="dropdown-user-email">admin@jashapparels.com</p>
                  <span className="dropdown-role-badge">
                    <Shield size={12} /> Administrator
                  </span>
                </div>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    router.push('/settings/company');
                  }}
                  className="dropdown-item"
                >
                  <User size={15} />
                  <span>Company Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    router.push('/settings/gst');
                  }}
                  className="dropdown-item"
                >
                  <CheckCircle2 size={15} />
                  <span>GST Configuration</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="dropdown-item text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Action Palette Modal */}
      {paletteOpen && (
        <div className="command-palette" onMouseDown={() => setPaletteOpen(false)}>
          <div
            className="command-dialog"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-1">
                <Search size={16} className="text-slate-400" />
                <input
                  autoFocus
                  className="w-full text-sm outline-none text-slate-800 bg-transparent"
                  placeholder="Search invoices, customers, settings..."
                />
              </div>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
                onClick={() => setPaletteOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Quick Actions
              </p>
              {[
                { name: 'Create Sales Invoice', href: '/dashboard/invoices/create' },
                { name: 'Add New Customer', href: '/dashboard/customers' },
                { name: 'GST Settings', href: '/settings/gst' },
                { name: 'Numbering Rules', href: '/settings/numbering' },
              ].map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => {
                    setPaletteOpen(false);
                    router.push(opt.href);
                  }}
                  className="command-option w-full text-left flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  <span>{opt.name}</span>
                  <span className="text-xs text-slate-400">↵</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
