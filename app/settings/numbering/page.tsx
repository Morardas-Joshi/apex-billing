'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Hash, Check, Save } from 'lucide-react';

export default function NumberingSettingsPage() {
  // Sales Order State
  const [soPrefix, setSoPrefix] = useState('SO');
  const [soYearFormat, setSoYearFormat] = useState('SINGLE');
  const [soSeparator, setSoSeparator] = useState('NONE');
  const [soPadding, setSoPadding] = useState('5');
  const [soStartNum, setSoStartNum] = useState('1');

  // Sales Invoice State
  const [invPrefix, setInvPrefix] = useState('INV');
  const [invYearFormat, setInvYearFormat] = useState('FY');
  const [invSeparator, setInvSeparator] = useState('SLASH');
  const [invPadding, setInvPadding] = useState('5');
  const [invStartNum, setInvStartNum] = useState('1');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Generate Live Previews
  const generatePreview = (
    prefix: string,
    yearFormat: string,
    separator: string,
    paddingStr: string,
    startNumStr: string
  ) => {
    const sep = separator === 'SLASH' ? '/' : separator === 'HYPHEN' ? '-' : '';
    let yearPart = '';
    if (yearFormat === 'SINGLE') {
      yearPart = '2026';
    } else if (yearFormat === 'FY') {
      yearPart = '2026-27';
    }
    const num = parseInt(startNumStr || '1', 10);
    const pad = Math.max(1, parseInt(paddingStr || '5', 10));
    const formattedNum = num.toString().padStart(pad, '0');

    if (yearPart) {
      return `${prefix}${sep}${yearPart}${sep}${formattedNum}`;
    }
    return `${prefix}${sep}${formattedNum}`;
  };

  const soPreview = generatePreview(
    soPrefix,
    soYearFormat,
    soSeparator,
    soPadding,
    soStartNum
  );
  const invPreview = generatePreview(
    invPrefix,
    invYearFormat,
    invSeparator,
    invPadding,
    invStartNum
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        {/* Left Settings Menu */}
        <SettingsMenu activeKey="numbering" />

        {/* Right Main Content */}
        <div>
          {/* Header & Save Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Numbering & Sequences</h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize prefix, year formatting, separators, and sequence padding rules
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="primary-save-btn"
            >
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved Sequence Rules!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Sequence Rules
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSave}>
            {/* Section 1: Sales Order Numbering */}
            <div className="settings-form-panel">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="form-panel-title mb-0">
                  <Hash size={18} className="text-indigo-600" />
                  <span>Sales Order Numbering</span>
                </h3>
                <span className="bg-indigo-50 text-indigo-700 font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200">
                  Preview: {soPreview}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="form-label">PREFIX</label>
                  <input
                    type="text"
                    value={soPrefix}
                    onChange={(e) => setSoPrefix(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">YEAR FORMAT</label>
                  <select
                    value={soYearFormat}
                    onChange={(e) => setSoYearFormat(e.target.value)}
                    className="form-select"
                  >
                    <option value="SINGLE">Single Year (e.g. 2026)</option>
                    <option value="FY">Financial Year (e.g. 2026-27)</option>
                    <option value="NONE">No Year</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">SEPARATOR</label>
                  <select
                    value={soSeparator}
                    onChange={(e) => setSoSeparator(e.target.value)}
                    className="form-select"
                  >
                    <option value="NONE">None (No Separator)</option>
                    <option value="SLASH">/ (Slash)</option>
                    <option value="HYPHEN">- (Hyphen)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">PADDING LENGTH</label>
                  <input
                    type="number"
                    value={soPadding}
                    onChange={(e) => setSoPadding(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">STARTING NUMBER</label>
                  <input
                    type="number"
                    value={soStartNum}
                    onChange={(e) => setSoStartNum(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Sales Invoice Numbering */}
            <div className="settings-form-panel">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="form-panel-title mb-0">
                  <Hash size={18} className="text-blue-600" />
                  <span>Sales Invoice Numbering</span>
                </h3>
                <span className="bg-blue-50 text-blue-700 font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200">
                  Preview: {invPreview}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="form-label">PREFIX</label>
                  <input
                    type="text"
                    value={invPrefix}
                    onChange={(e) => setInvPrefix(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">YEAR FORMAT</label>
                  <select
                    value={invYearFormat}
                    onChange={(e) => setInvYearFormat(e.target.value)}
                    className="form-select"
                  >
                    <option value="FY">Financial Year (e.g. 2026-27)</option>
                    <option value="SINGLE">Single Year (e.g. 2026)</option>
                    <option value="NONE">No Year</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">SEPARATOR</label>
                  <select
                    value={invSeparator}
                    onChange={(e) => setInvSeparator(e.target.value)}
                    className="form-select"
                  >
                    <option value="SLASH">/ (Slash)</option>
                    <option value="HYPHEN">- (Hyphen)</option>
                    <option value="NONE">None (No Separator)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">PADDING LENGTH</label>
                  <input
                    type="number"
                    value={invPadding}
                    onChange={(e) => setInvPadding(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">STARTING NUMBER</label>
                  <input
                    type="number"
                    value={invStartNum}
                    onChange={(e) => setInvStartNum(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
