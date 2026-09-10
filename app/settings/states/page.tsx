'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { MapPin, Search } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/formatters';

export default function StatesMasterSettingsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = INDIAN_STATES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.includes(searchTerm)
  );

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        <SettingsMenu activeKey="states" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">States & UTs Master</h2>
              <p className="text-xs text-slate-500 mt-1">
                Official Indian GST 2-digit state and union territory codes
              </p>
            </div>

            <div className="relative w-64">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search state or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="settings-form-panel p-0 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">State Code</th>
                  <th className="py-3 px-4">State / Territory Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Tax Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStates.map((st) => (
                  <tr key={st.code} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{st.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{st.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {['07', '25', '26', '31', '34', '35', '37', '38'].includes(st.code)
                        ? 'Union Territory'
                        : 'State'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">CGST + SGST (Intra-state)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
