import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from '../components/ui/Common';

export default function Donatur() {
  const [searchTerm, setSearchTerm] = useState('');

  const donaturData = [
    { id: 'DON-001', name: 'Hamba Allah', type: 'Individu', phone: '08123456789', city: 'Jakarta', status: 'Aktif' },
    { id: 'DON-002', name: 'Budi Santoso', type: 'Individu', phone: '08129998887', city: 'Bandung', status: 'Aktif' },
    { id: 'DON-003', name: 'Yayasan Berkah', type: 'Lembaga', phone: '021-555666', city: 'Surabaya', status: 'Aktif' },
    { id: 'DON-004', name: 'Siti Aminah', type: 'Individu', phone: '08564443332', city: 'Jakarta', status: 'Non-Aktif' },
    { id: 'DON-005', name: 'PT. Maju Jaya', type: 'Lembaga', phone: '021-777888', city: 'Tangerang', status: 'Aktif' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Nama Donatur', accessor: 'name' as const, className: 'font-bold text-slate-800' },
    { header: 'Jenis', accessor: 'type' as const },
    { header: 'No. HP', accessor: 'phone' as const },
    { header: 'Kota', accessor: 'city' as const },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Aksi',
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
            <Eye size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-500 transition-colors">
            <Edit size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Donatur</h1>
          <p className="text-slate-500 text-sm">Kelola informasi seluruh donatur lembaga Anda.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all">
          <Plus size={20} />
          <span>Tambah Donatur</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, ID, atau no. HP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2">
          <DataTable columns={columns} data={donaturData} />
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <p>Menampilkan 5 dari 1.240 donatur</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Sebelumnya</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
