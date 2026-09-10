'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Receipt, Save, Check, Plus } from 'lucide-react';

export default function PaymentTermsSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        <SettingsMenu activeKey="payment-terms" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Payment Terms</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure default payment due periods, grace periods, and terms
              </p>
            </div>
            <button type="button" onClick={handleSave} className="primary-save-btn">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved Payment Terms!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Payment Terms
                </>
              )}
            </button>
          </div>

          <div className="settings-form-panel">
            <h3 className="form-panel-title text-emerald-700">
              <Receipt size={20} className="text-emerald-600" />
              <span>Standard Payment Terms</span>
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Net 15 Days', days: 15, isDefault: true, desc: 'Payment due within 15 days of invoice date' },
                { name: 'Net 30 Days', days: 30, isDefault: false, desc: 'Payment due within 30 days of invoice date' },
                { name: 'Due on Receipt', days: 0, isDefault: false, desc: 'Immediate payment due upon receipt' },
                { name: 'Net 45 Days', days: 45, isDefault: false, desc: 'Payment due within 45 days' },
              ].map((term) => (
                <div key={term.name} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{term.name}</span>
                      {term.isDefault && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{term.desc}</p>
                  </div>
                  <span className="font-bold text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                    {term.days} Days
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
