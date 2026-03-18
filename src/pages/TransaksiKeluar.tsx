import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, ExternalLink, MapPin } from 'lucide-react';
import { DataTable } from '../components/ui/Common';

export default function TransaksiKeluar() {
  const [searchTerm, setSearchTerm] = useState('');

  const dataKeluar = [
    { id: 'TRX-K-001', date: '17 Mar 2026', recipient: 'Ahmad Subarjo', asnaf: 'Fakir', program: 'Sembako Rutin', amount: 'Rp 500.000', location: 'Jakarta Pusat', status: 'Selesai' },
    { id: 'TRX-K-002', date: '16 Mar 2026', recipient: 'Siti Khotimah', asnaf: 'Miskin', program: 'Beasiswa Santri', amount: 'Rp 2.500.000', location: 'Bandung', status: 'Selesai' },
    { id: 'TRX-K-003', date: '15 Mar 2026', recipient: 'Warga Desa Sukamaju', asnaf: 'Umum', program: 'Sumur Wakaf', amount: 'Rp 45.000.000', location: 'Gunung Kidul', status: 'Proses' },
    { id: 'TRX-K-004', date: '14 Mar 2026', recipient: 'Fatimah Az-Zahra', asnaf: 'Yatim', program: 'Beasiswa Santri', amount: 'Rp 1.200.000', location: 'Jakarta Timur', status: 'Selesai' },
    { id: 'TRX-K-005', date: '14 Mar 2026', recipient: 'Masjid Al-Ikhlas', asnaf: 'Fisabilillah', program: 'Dakwah Pedalaman', amount: 'Rp 5.000.000', location: 'Papua', status: 'Selesai' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { 
      header: 'Penerima & Lokasi', 
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{item.recipient}</span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold uppercase">
            <MapPin size={10} /> {item.location}
          </span>
        </div>
      )
    },
    { header: 'Asnaf / Program', accessor: (item: any) => (
      <div className="flex flex-col">
        <span className="text-slate-600">{item.asnaf}</span>
        <span className="text-[10px] text-orange-500 font-bold uppercase">{item.program}</span>
      </div>
    )},
    { header: 'Nominal', accessor: 'amount' as const, className: 'font-bold text-slate-800' },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Aksi',
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
            <ExternalLink size={18} />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500 transition-colors">
            <FileText size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaksi Keluar</h1>
          <p className="text-slate-500 text-sm">Catat penyaluran dana kepada mustahik dan program terkait.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-100 transition-all">
          <Plus size={20} />
          <span>Input Penyaluran Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari penerima atau ID transaksi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filter Program</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2">
          <DataTable columns={columns} data={dataKeluar} />
        </div>
      </div>
    </div>
  );
}
