import React from 'react';
import Link from 'next/link';
import { SettingsMenu } from '@/components/SettingsMenu';
import {
  Building,
  Calendar,
  ShieldCheck,
  Percent,
  Hash,
  Sliders,
  ArrowRight,
} from 'lucide-react';

export default function SettingsOverviewPage() {
  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        {/* Left Settings Navigation Menu */}
        <SettingsMenu activeKey="overview" />

        {/* Right Content Area: 6 Cards Overview Grid */}
        <div>
          <div className="settings-overview-grid">
            {/* Card 1: Company Identity */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-card-icon-box icon-box-blue">
                    <Building size={20} />
                  </div>
                  <div className="settings-card-title-box">
                    <h3 className="settings-card-title">Company Identity</h3>
                    <p className="settings-card-subtitle">Jash Apparels</p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <div className="card-info-row">
                    <span className="card-info-label">City:</span>
                    <span className="card-info-value">Ahmedabad</span>
                  </div>
                  <div className="card-info-row">
                    <span className="card-info-label">State:</span>
                    <span className="card-info-value">Gujarat (Code 24)</span>
                  </div>
                  <div className="card-info-row">
                    <span className="card-info-label">PAN:</span>
                    <span className="card-info-value">Not Configured</span>
                  </div>
                </div>
              </div>
              <Link href="/settings/company" className="settings-card-link">
                <span>Configure Company</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 2: Financial Year */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-card-icon-box icon-box-indigo">
                    <Calendar size={20} />
                  </div>
                  <div className="settings-card-title-box">
                    <h3 className="settings-card-title">Financial Year</h3>
                    <p className="settings-card-subtitle">FY 2026-27</p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <div className="card-info-row">
                    <span className="card-info-label">Period:</span>
                    <span className="card-info-value">1 Apr 2026 - 31 Mar 2027</span>
                  </div>
                  <div className="card-info-row">
                    <span className="card-info-label">Status:</span>
                    <span className="text-emerald-600 font-bold">Open</span>
                  </div>
                </div>
              </div>
              <Link href="/settings/financial-year" className="settings-card-link">
                <span>Configure Financial Year</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 3: GST Registration */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-card-icon-box icon-box-emerald">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="settings-card-title-box">
                    <h3 className="settings-card-title">GST Registration</h3>
                    <span className="settings-card-badge badge-green mt-1">
                      GST Registered
                    </span>
                  </div>
                </div>
                <div className="settings-card-body">
                  <div className="card-info-row">
                    <span className="card-info-label">GSTIN:</span>
                    <span className="card-info-value">Not Configured</span>
                  </div>
                  <div className="card-info-row">
                    <span className="card-info-label">Pricing Mode:</span>
                    <span className="card-info-value">TAX_EXCLUSIVE</span>
                  </div>
                </div>
              </div>
              <Link href="/settings/gst" className="settings-card-link">
                <span>Configure GST</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 4: Tax Master */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-card-icon-box icon-box-purple">
                    <Percent size={20} />
                  </div>
                  <div className="settings-card-title-box">
                    <h3 className="settings-card-title">Tax Master</h3>
                    <p className="settings-card-subtitle">Default: 18%</p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <div className="card-info-row">
                    <span className="card-info-label">Active Tax Slabs:</span>
                    <span className="card-info-value">5 Slabs (0%, 5%, 12%, 18%, 28%)</span>
                  </div>
                </div>
              </div>
              <Link href="/settings/tax" className="settings-card-link">
                <span>Configure Taxes</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 5: Numbering Sequences */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-card-icon-box icon-box-amber">
                    <Hash size={20} />
                  </div>
                  <div className="settings-card-title-box">
                    <h3 className="settings-card-title">Numbering Sequences</h3>
                    <p className="settings-card-subtitle text-amber-700 font-medium">
                      INV/2026-27/00001
                    </p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <div className="card-info-row">
                    <span className="card-info-label">Invoice:</span>
                    <span className="card-info-value">INV/2026-27/00001</span>
                  </div>
                  <div className="card-info-row">
                    <span className="card-info-label">Sales Order:</span>
                    <span className="card-info-value">S0202600001</span>
                  </div>
                </div>
              </div>
              <Link href="/settings/numbering" className="settings-card-link">
                <span>Configure Numbering</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 6: General Settings */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-card-icon-box icon-box-slate">
                    <Sliders size={20} />
                  </div>
                  <div className="settings-card-title-box">
                    <h3 className="settings-card-title">General Settings</h3>
                    <p className="settings-card-subtitle">INR (₹)</p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <div className="card-info-row">
                    <span className="card-info-label">Date Format:</span>
                    <span className="card-info-value">DD/MM/YYYY</span>
                  </div>
                  <div className="card-info-row">
                    <span className="card-info-label">Time Zone:</span>
                    <span className="card-info-value">Asia/Kolkata</span>
                  </div>
                </div>
              </div>
              <Link href="/settings/general" className="settings-card-link">
                <span>Configure General</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
