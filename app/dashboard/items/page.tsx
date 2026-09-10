import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Package, Plus } from 'lucide-react';

export default function ItemsMasterPage() {
  const sampleItems = [
    { name: 'Software Consultancy & IT Services', hsn: '998311', type: 'SERVICE', price: '₹1,500 / hr', gst: '18%' },
    { name: 'Enterprise Cloud Infrastructure Setup', hsn: '998313', type: 'SERVICE', price: '₹45,000 / unit', gst: '18%' },
    { name: 'Apparel Textiles Batch (Cotton)', hsn: '520832', type: 'GOODS', price: '₹850 / meter', gst: '12%' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="Items & Products Master" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Items & Services Catalog</h1>
            <p className="text-xs text-slate-500 mt-1">Manage HSN/SAC codes, tax slabs, and unit prices</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2">
            <Plus size={16} /> Add Item / Service
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Item / Service Name</th>
                <th className="py-3.5 px-6">HSN / SAC Code</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Default Rate</th>
                <th className="py-3.5 px-6">GST Slab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleItems.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50">
                  <td className="py-4 px-6 font-bold text-slate-900">{item.name}</td>
                  <td className="py-4 px-6 font-mono font-bold text-indigo-600">{item.hsn}</td>
                  <td className="py-4 px-6 text-slate-600">{item.type}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{item.price}</td>
                  <td className="py-4 px-6 font-bold text-emerald-600">{item.gst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
