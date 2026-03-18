import React from 'react';
import { Plus, Shield, User, Mail, Key } from 'lucide-react';
import { DataTable } from '../components/ui/Common';

export default function Pengguna() {
  const users = [
    { id: 'USR-001', name: 'Akrom Achmad', email: 'akrom.ach@gmail.com', role: 'super_admin', status: 'Aktif' },
    { id: 'USR-002', name: 'Siti Sarah', email: 'sarah@ziswaf.org', role: 'keuangan', status: 'Aktif' },
    { id: 'USR-003', name: 'Budi Raharjo', email: 'budi@ziswaf.org', role: 'admin_penghimpunan', status: 'Aktif' },
    { id: 'USR-004', name: 'Dewi Lestari', email: 'dewi@ziswaf.org', role: 'admin_penyaluran', status: 'Non-Aktif' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { 
      header: 'Nama & Email', 
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{item.name}</span>
          <span className="text-xs text-slate-400">{item.email}</span>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: (item: any) => (
        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
          {item.role.replace('_', ' ')}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Aksi',
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary">
            <Key size={16} />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500">
            <User size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm">Kelola akses dan hak istimewa admin lembaga.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100">
          <Plus size={20} /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2">
          <DataTable columns={columns} data={users} />
        </div>
      </div>
    </div>
  );
}
