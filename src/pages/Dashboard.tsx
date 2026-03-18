import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  HandCoins, 
  Users, 
  Target,
  ArrowRight
} from 'lucide-react';
import { StatCard, DataTable } from '../components/ui/Common';

export default function Dashboard() {
  const stats = [
    { title: 'Total Saldo Kas', value: 'Rp 1.250.450.000', icon: Wallet, trend: { value: '12%', isPositive: true } },
    { title: 'Penghimpunan (Bulan Ini)', value: 'Rp 45.200.000', icon: HandCoins, trend: { value: '5.4%', isPositive: true } },
    { title: 'Penyaluran (Bulan Ini)', value: 'Rp 32.150.000', icon: TrendingDown, trend: { value: '2.1%', isPositive: false }, color: 'bg-orange-500' },
    { title: 'Jumlah Donatur Aktif', value: '1.240', icon: Users, trend: { value: '18', isPositive: true }, color: 'bg-blue-500' },
  ];

  const recentTransactions = [
    { id: 'TRX-001', date: '17 Mar 2026', name: 'Hamba Allah', type: 'Zakat Maal', amount: 'Rp 5.000.000', status: 'Berhasil' },
    { id: 'TRX-002', date: '16 Mar 2026', name: 'Budi Santoso', type: 'Infak Terikat', amount: 'Rp 250.000', status: 'Berhasil' },
    { id: 'TRX-003', date: '16 Mar 2026', name: 'Siti Aminah', type: 'Sedekah Subuh', amount: 'Rp 50.000', status: 'Menunggu' },
    { id: 'TRX-004', date: '15 Mar 2026', name: 'PT. Maju Jaya', type: 'Zakat Profesi', amount: 'Rp 12.500.000', status: 'Berhasil' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Tanggal', accessor: 'date' as const },
    { header: 'Donatur', accessor: 'name' as const },
    { header: 'Jenis Dana', accessor: 'type' as const },
    { header: 'Nominal', accessor: 'amount' as const, className: 'font-bold text-slate-800' },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          item.status === 'Berhasil' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {item.status}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assalamu'alaikum, Admin!</h1>
          <p className="text-slate-500">Berikut adalah ringkasan pengelolaan ZISWAF hari ini.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary-light px-4 py-2 rounded-lg">
          <TrendingUp size={16} />
          <span>Update Terakhir: 17 Mar 2026, 11:27</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Transaksi Terbaru</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-2">
            <DataTable columns={columns} data={recentTransactions} />
          </div>
        </div>

        {/* Program Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6">Program Prioritas</h3>
          <div className="space-y-6">
            {[
              { name: 'Beasiswa Santri Penghafal Al-Qur\'an', target: 'Rp 500jt', current: 75, color: 'bg-emerald-500' },
              { name: 'Pembangunan RS Gratis Dhuafa', target: 'Rp 2M', current: 42, color: 'bg-blue-500' },
              { name: 'Sumur Wakaf Desa Kekeringan', target: 'Rp 150jt', current: 90, color: 'bg-amber-500' },
            ].map((prog, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">{prog.name}</span>
                  <span className="font-bold text-slate-400">{prog.current}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${prog.color} transition-all duration-1000`} 
                    style={{ width: `${prog.current}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Target: {prog.target}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border-2 border-slate-100 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
            Kelola Semua Program
          </button>
        </div>
      </div>
    </div>
  );
}
