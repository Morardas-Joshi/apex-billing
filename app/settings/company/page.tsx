'use client';

import React, { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Building, Save, Check } from 'lucide-react';

export default function CompanySettingsPage() {
  const [companyName, setCompanyName] = useState('Jash Apparels');
  const [tradeName, setTradeName] = useState('Jash Apparels ERP');
  const [pan, setPan] = useState('ABCDE1234F');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('admin@jashapparels.com');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('24-Gujarat');
  const [pincode, setPincode] = useState('380001');
  const [address, setAddress] = useState('101, Textile Market, Ring Road');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-two-column-layout">
        <SettingsMenu activeKey="company" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Company Identity</h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage business details, legal name, PAN, and address
              </p>
            </div>
            <button type="button" onClick={handleSave} className="primary-save-btn">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved Company Info!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Company Details
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSave} className="settings-form-panel">
            <h3 className="form-panel-title text-blue-700">
              <Building size={20} className="text-blue-600" />
              <span>Business Profile</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="form-label">Legal Business Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Trade Name</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Business PAN Number</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">State (GST Code)</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-select"
                >
                  <option value="24-Gujarat">24 - Gujarat</option>
                  <option value="27-Maharashtra">27 - Maharashtra</option>
                  <option value="07-Delhi">07 - Delhi</option>
                  <option value="29-Karnataka">29 - Karnataka</option>
                  <option value="33-Tamil Nadu">33 - Tamil Nadu</option>
                </select>
              </div>

              <div>
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Registered Office Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
