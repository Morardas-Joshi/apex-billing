'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Calendar, Save, Check, Plus } from 'lucide-react';

export default function FinancialYearSettingsPage() {
  const [activeFy, setActiveFy] = useState('FY 2026-27');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        <SettingsMenu activeKey="financial-year" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Financial Year</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure Indian accounting fiscal periods and active status
              </p>
            </div>
            <button type="button" onClick={handleSave} className="primary-save-btn">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Fiscal Settings
                </>
              )}
            </button>
          </div>

          <div className="settings-form-panel">
            <h3 className="form-panel-title text-indigo-700">
              <Calendar size={20} className="text-indigo-600" />
              <span>Active Financial Period</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">FY 2026-27</h4>
                  <p className="text-xs text-slate-500 mt-1">1 April 2026 — 31 March 2027</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">
                  Active Period
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">Historical & Future Periods</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                {[
                  { fy: 'FY 2025-26', period: '1 Apr 2025 - 31 Mar 2026', status: 'Closed' },
                  { fy: 'FY 2024-25', period: '1 Apr 2024 - 31 Mar 2025', status: 'Archived' },
                ].map((item) => (
                  <div key={item.fy} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-slate-800">{item.fy}</p>
                      <p className="text-xs text-slate-400">{item.period}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
