'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Percent, Save, Check, Plus } from 'lucide-react';

export default function TaxMasterSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        <SettingsMenu activeKey="tax" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tax Master</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure GST tax rate slabs, CGST/SGST/IGST splits, and exemptions
              </p>
            </div>
            <button type="button" onClick={handleSave} className="primary-save-btn">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved Tax Slabs!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Tax Configuration
                </>
              )}
            </button>
          </div>

          <div className="settings-form-panel">
            <h3 className="form-panel-title text-purple-700">
              <Percent size={20} className="text-purple-600" />
              <span>Standard GST Rate Slabs</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {[
                { name: 'GST 18% Standard Services & Products', rate: 18, cgst: 9, sgst: 9, igst: 18, isDefault: true },
                { name: 'GST 12% Apparels & Textiles', rate: 12, cgst: 6, sgst: 6, igst: 12, isDefault: false },
                { name: 'GST 5% Essential Items', rate: 5, cgst: 2.5, sgst: 2.5, igst: 5, isDefault: false },
                { name: 'GST 28% Luxury & Automotive', rate: 28, cgst: 14, sgst: 14, igst: 28, isDefault: false },
                { name: 'GST 0% Exempt / Zero Rated', rate: 0, cgst: 0, sgst: 0, igst: 0, isDefault: false },
              ].map((slab) => (
                <div key={slab.rate} className="p-4 bg-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{slab.name}</span>
                      {slab.isDefault && (
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Intra-state: CGST ({slab.cgst}%) + SGST ({slab.sgst}%) | Inter-state: IGST ({slab.igst}%)
                    </p>
                  </div>
                  <span className="font-mono text-base font-extrabold text-purple-600">
                    {slab.rate}%
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
