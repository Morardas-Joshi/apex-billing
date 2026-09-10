import React from 'react';
import { Navbar } from '@/components/Navbar';
import { BookOpen } from 'lucide-react';

export default function UserManualPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="User Manual & Guides" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">User Documentation & Workflow Guide</h1>
          <p className="text-xs text-slate-500 mt-1">Learn how to configure Indian GST billing, generate tax invoices, and reconcile GSTR returns</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">GST Invoice Generation Guide</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Step-by-step instructions for selecting intra-state (CGST + SGST) vs inter-state (IGST) supplies, adding HSN/SAC codes, and printing compliant PDF tax invoices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
