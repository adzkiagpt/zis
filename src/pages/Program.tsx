import React, { useState } from 'react';
import { Plus, Search, Target, Calendar, User, MoreVertical } from 'lucide-react';
import { DataTable } from '../components/ui/Common';

export default function Program() {
  const [searchTerm, setSearchTerm] = useState('');

  const programData = [
    { id: 'PRG-001', name: 'Beasiswa Santri Penghafal Al-Qur\'an', category: 'Pendidikan', target: 'Rp 500.000.000', status: 'Aktif', pic: 'Ust. Ahmad' },
    { id: 'PRG-002', name: 'Pembangunan RS Gratis Dhuafa', category: 'Kesehatan', target: 'Rp 2.000.000.000', status: 'Aktif', pic: 'dr. Sarah' },
    { id: 'PRG-003', name: 'Sumur Wakaf Desa Kekeringan', category: 'Kemanusiaan', target: 'Rp 150.000.000', status: 'Aktif', pic: 'Bpk. Heru' },
    { id: 'PRG-004', name: 'Sembako Rutin Lansia Dhuafa', category: 'Sosial', target: 'Rp 50.000.000', status: 'Aktif', pic: 'Ibu Maya' },
    { id: 'PRG-005', name: 'Modal Usaha UMKM Berkah', category: 'Ekonomi', target: 'Rp 300.000.000', status: 'Selesai', pic: 'Bpk. Rian' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { 
      header: 'Nama Program', 
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{item.name}</span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.category}</span>
        </div>
      )
    },
    { header: 'Target Dana', accessor: 'target' as const },
    { header: 'PIC', accessor: 'pic' as const },
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
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
          <MoreVertical size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Program ZISWAF</h1>
          <p className="text-slate-500 text-sm">Kelola daftar program penyaluran dana lembaga Anda.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all">
          <Plus size={20} />
          <span>Buat Program Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama program atau PIC..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light text-primary rounded-lg flex items-center justify-center">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Program Aktif</p>
              <p className="text-lg font-bold text-slate-800">12 Program</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2">
          <DataTable columns={columns} data={programData} />
        </div>
      </div>
    </div>
  );
}
