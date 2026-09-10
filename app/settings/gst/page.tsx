'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ShieldCheck, Check, Save } from 'lucide-react';

export default function GSTSettingsPage() {
  const [gstin, setGstin] = useState('');
  const [regType, setRegType] = useState('Regular');
  const [pricingMode, setPricingMode] = useState<'EXCLUSIVE' | 'INCLUSIVE'>('EXCLUSIVE');
  const [defaultSlab, setDefaultSlab] = useState('18');
  const [enableCess, setEnableCess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        {/* Left Navigation Menu */}
        <SettingsMenu activeKey="gst" />

        {/* Right Main Form Container */}
        <div>
          {/* Header Bar with Action Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-500">Configure GST registration details and taxation pricing rules</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="primary-save-btn"
            >
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved Successfully!
                </>
              ) : (
                <>
                  <Save size={16} /> Save GST Preferences
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSave}>
            {/* Section 1: GST Registration */}
            <div className="settings-form-panel">
              <h2 className="form-panel-title text-emerald-700">
                <ShieldCheck size={20} className="text-emerald-600" />
                <span>GST Registration</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 24ABCDE1234F1Z5"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Registration Type</label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value)}
                    className="form-select"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Composition">Composition</option>
                    <option value="SEZ">SEZ Developer / Unit</option>
                    <option value="Unregistered">Unregistered Business</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Tax Computation & Pricing Modes */}
            <div className="settings-form-panel">
              <h2 className="form-panel-title">Tax Computation & Pricing Modes</h2>

              {/* Default Tax Pricing Mode */}
              <div className="mb-6">
                <label className="form-label mb-3">Default Tax Pricing Mode</label>
                <div className="choice-card-grid">
                  <div
                    onClick={() => setPricingMode('EXCLUSIVE')}
                    className={`choice-card ${
                      pricingMode === 'EXCLUSIVE' ? 'selected-choice' : ''
                    }`}
                  >
                    <h4 className="choice-title">Tax Exclusive</h4>
                    <p className="choice-desc">
                      Tax is added on top of selling price
                    </p>
                  </div>

                  <div
                    onClick={() => setPricingMode('INCLUSIVE')}
                    className={`choice-card ${
                      pricingMode === 'INCLUSIVE' ? 'selected-choice' : ''
                    }`}
                  >
                    <h4 className="choice-title">Tax Inclusive</h4>
                    <p className="choice-desc">
                      Entered selling price includes GST
                    </p>
                  </div>
                </div>
              </div>

              {/* Default GST Rate Slabs */}
              <div>
                <label className="form-label">Default GST Rate Slabs</label>
                <select
                  value={defaultSlab}
                  onChange={(e) => setDefaultSlab(e.target.value)}
                  className="form-select max-w-md"
                >
                  <option value="0">GST 0% (Exempt)</option>
                  <option value="5">GST 5% (5%)</option>
                  <option value="12">GST 12% (12%)</option>
                  <option value="18">GST 18% (18%)</option>
                  <option value="28">GST 28% (28%)</option>
                </select>
              </div>
            </div>

            {/* Section 3: Compensation Cess */}
            <div className="settings-form-panel">
              <h2 className="form-panel-title">Compensation Cess</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cess-check"
                  checked={enableCess}
                  onChange={(e) => setEnableCess(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="cess-check" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Enable Compensation Cess for items
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
