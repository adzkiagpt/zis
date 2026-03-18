import React, { useState } from 'react';
import { Plus, Search, Filter, Download, CheckCircle, Clock } from 'lucide-react';
import { DataTable } from '../components/ui/Common';

export default function TransaksiMasuk() {
  const [searchTerm, setSearchTerm] = useState('');

  const dataMasuk = [
    { id: 'TRX-M-001', date: '17 Mar 2026', donatur: 'Hamba Allah', type: 'Zakat Maal', program: 'Umum', amount: 'Rp 5.000.000', method: 'Transfer BCA', status: 'Terverifikasi' },
    { id: 'TRX-M-002', date: '16 Mar 2026', donatur: 'Budi Santoso', type: 'Infak', program: 'Beasiswa Santri', amount: 'Rp 250.000', method: 'QRIS', status: 'Terverifikasi' },
    { id: 'TRX-M-003', date: '16 Mar 2026', donatur: 'Siti Aminah', type: 'Sedekah', program: 'Sembako Lansia', amount: 'Rp 50.000', method: 'Tunai', status: 'Menunggu' },
    { id: 'TRX-M-004', date: '15 Mar 2026', donatur: 'PT. Maju Jaya', type: 'Zakat Profesi', program: 'Umum', amount: 'Rp 12.500.000', method: 'Transfer Mandiri', status: 'Terverifikasi' },
    { id: 'TRX-M-005', date: '15 Mar 2026', donatur: 'Hamba Allah', type: 'Wakaf', program: 'Sumur Wakaf', amount: 'Rp 1.000.000', method: 'Transfer BSI', status: 'Terverifikasi' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { 
      header: 'Tanggal & Donatur', 
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{item.donatur}</span>
          <span className="text-[10px] text-slate-400 font-bold">{item.date}</span>
        </div>
      )
    },
    { header: 'Jenis / Program', accessor: (item: any) => (
      <div className="flex flex-col">
        <span className="text-slate-600">{item.type}</span>
        <span className="text-[10px] text-primary font-bold uppercase">{item.program}</span>
      </div>
    )},
    { header: 'Nominal', accessor: 'amount' as const, className: 'font-bold text-slate-800' },
    { header: 'Metode', accessor: 'method' as const },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <div className="flex items-center gap-1.5">
          {item.status === 'Terverifikasi' ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
              <CheckCircle size={12} /> {item.status}
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase">
              <Clock size={12} /> {item.status}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Aksi',
      accessor: (item: any) => (
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
          <Download size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaksi Masuk</h1>
          <p className="text-slate-500 text-sm">Catat dan verifikasi seluruh dana yang masuk ke lembaga.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all">
          <Plus size={20} />
          <span>Input Donasi Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari donatur atau ID transaksi..."
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
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2">
          <DataTable columns={columns} data={dataMasuk} />
        </div>
      </div>
    </div>
  );
}
