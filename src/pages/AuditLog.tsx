import React from 'react';
import { History, User, Activity, Clock } from 'lucide-react';
import { DataTable } from '../components/ui/Common';

export default function AuditLog() {
  const logs = [
    { id: 'LOG-001', time: '17 Mar 2026, 11:20', user: 'Akrom Achmad', action: 'Tambah Donatur', module: 'Donatur', detail: 'Menambahkan donatur baru: DON-006' },
    { id: 'LOG-002', time: '17 Mar 2026, 10:45', user: 'Siti Sarah', action: 'Verifikasi Transaksi', module: 'Transaksi Masuk', detail: 'Verifikasi TRX-M-003' },
    { id: 'LOG-003', time: '16 Mar 2026, 16:30', user: 'Akrom Achmad', action: 'Edit Program', module: 'Program', detail: 'Mengubah target dana PRG-002' },
    { id: 'LOG-004', time: '16 Mar 2026, 14:15', user: 'Budi Raharjo', action: 'Login', module: 'Auth', detail: 'Login berhasil dari IP 192.168.1.1' },
    { id: 'LOG-005', time: '16 Mar 2026, 09:00', user: 'Siti Sarah', action: 'Hapus Transaksi', module: 'Transaksi Keluar', detail: 'Menghapus draf TRX-K-009' },
  ];

  const columns = [
    { header: 'Waktu', accessor: 'time' as const, className: 'whitespace-nowrap' },
    { header: 'User', accessor: 'user' as const, className: 'font-bold text-slate-800' },
    { 
      header: 'Aksi', 
      accessor: (item: any) => (
        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
          {item.action}
        </span>
      )
    },
    { header: 'Modul', accessor: 'module' as const },
    { header: 'Detail Aktivitas', accessor: 'detail' as const, className: 'text-xs text-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
        <p className="text-slate-500 text-sm">Rekam jejak seluruh aktivitas admin dalam sistem.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2">
          <DataTable columns={columns} data={logs} />
        </div>
      </div>
    </div>
  );
}
