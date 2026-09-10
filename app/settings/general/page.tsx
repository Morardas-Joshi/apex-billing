'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Sliders, Save, Check } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        <SettingsMenu activeKey="general" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">General System</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure regional formatting, currency, and system localization
              </p>
            </div>
            <button type="button" onClick={handleSave} className="primary-save-btn">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved General Settings!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Settings
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSave} className="settings-form-panel">
            <h3 className="form-panel-title text-slate-800">
              <Sliders size={20} className="text-slate-600" />
              <span>Localization & Currency</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="form-select"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="form-select"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                </select>
              </div>

              <div>
                <label className="form-label">System Time Zone</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="form-select"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
