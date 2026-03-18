import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../components/ui/Common';

export default function Mustahik() {
  const [searchTerm, setSearchTerm] = useState('');

  const mustahikData = [
    { id: 'MUS-001', name: 'Ahmad Subarjo', nik: '317101234567890', asnaf: 'Fakir', program: 'Sembako Rutin', status: 'Terverifikasi' },
    { id: 'MUS-002', name: 'Siti Khotimah', nik: '317102234567891', asnaf: 'Miskin', program: 'Beasiswa Santri', status: 'Terverifikasi' },
    { id: 'MUS-003', name: 'Ujang Hermawan', nik: '317103234567892', asnaf: 'Gharimin', program: 'Bantuan Modal', status: 'Proses' },
    { id: 'MUS-004', name: 'Fatimah Az-Zahra', nik: '317104234567893', asnaf: 'Yatim', program: 'Beasiswa Santri', status: 'Terverifikasi' },
    { id: 'MUS-005', name: 'M. Yusuf', nik: '317105234567894', asnaf: 'Fisabilillah', program: 'Dakwah Pedalaman', status: 'Terverifikasi' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Nama Mustahik', accessor: 'name' as const, className: 'font-bold text-slate-800' },
    { header: 'Asnaf', accessor: 'asnaf' as const },
    { header: 'Program Utama', accessor: 'program' as const },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            item.status === 'Terverifikasi' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {item.status}
          </span>
          {item.status === 'Terverifikasi' && <CheckCircle2 size={14} className="text-emerald-500" />}
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Mustahik</h1>
          <p className="text-slate-500 text-sm">Kelola data penerima manfaat (Mustahik) dan status verifikasinya.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all">
          <Plus size={20} />
          <span>Tambah Mustahik</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, NIK, atau ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filter Asnaf</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2">
          <DataTable columns={columns} data={mustahikData} />
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <p>Menampilkan 5 dari 850 mustahik</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Sebelumnya</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
