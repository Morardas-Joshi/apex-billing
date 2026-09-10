'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Palette, Check, Save, FileText } from 'lucide-react';

export default function DocumentTemplatesSettingsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('GST_TAX_INVOICE');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        <SettingsMenu activeKey="templates" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Document Templates</h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize printable GST Tax Invoice, Sales Order, and Receipt layout themes
              </p>
            </div>
            <button type="button" onClick={handleSave} className="primary-save-btn">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Template Saved!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Template Setup
                </>
              )}
            </button>
          </div>

          <div className="settings-form-panel">
            <h3 className="form-panel-title text-indigo-700">
              <Palette size={20} className="text-indigo-600" />
              <span>GST Compliant Printable Layouts</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'GST_TAX_INVOICE', name: 'Standard GST Tax Invoice', desc: 'Compliant with CGST, SGST, IGST splits and HSN/SAC table' },
                { id: 'MINIMAL_SLIM', name: 'Modern Minimal Theme', desc: 'Clean layout with header logo and QR code payment panel' },
                { id: 'COMPACT_RETAIL', name: 'Compact Thermal / Retail', desc: 'Optimized for quick retail counter printing and thermal slips' },
              ].map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedTemplate === tmpl.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText size={20} className={selectedTemplate === tmpl.id ? 'text-blue-600' : 'text-slate-400'} />
                    {selectedTemplate === tmpl.id && (
                      <span className="bg-blue-600 text-white rounded-full p-1">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{tmpl.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{tmpl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
