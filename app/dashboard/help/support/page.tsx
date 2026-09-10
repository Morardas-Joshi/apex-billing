import React from 'react';
import { Navbar } from '@/components/Navbar';
import { MessageCircle, Mail, PhoneCall } from 'lucide-react';

export default function SupportFAQPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="Support & FAQ" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">EasyInvoice Helpdesk & Support</h1>
          <p className="text-xs text-slate-500 mt-1">Get technical help, billing assistance, or feature requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Email Technical Support</h3>
              <p className="text-xs text-slate-500 mt-1">support@jashapparels.com</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <PhoneCall size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">GST Helpline Hotline</h3>
              <p className="text-xs text-slate-500 mt-1">+91 (079) 2658-0000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
