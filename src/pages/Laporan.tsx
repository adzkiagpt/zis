import React from 'react';
import { FileBarChart, Download, Filter, Calendar } from 'lucide-react';

export default function Laporan() {
  const reports = [
    { title: 'Laporan Penghimpunan Bulanan', desc: 'Rekapitulasi seluruh dana masuk berdasarkan jenis dana dan program.', icon: FileBarChart },
    { title: 'Laporan Penyaluran Per Asnaf', desc: 'Detail penyaluran dana kepada mustahik berdasarkan kategori asnaf.', icon: FileBarChart },
    { title: 'Laporan Saldo Dana ZISWAF', desc: 'Posisi saldo kas terkini untuk masing-masing jenis dana.', icon: FileBarChart },
    { title: 'Laporan Aktivitas Program', desc: 'Realisasi dana dan perkembangan status program prioritas.', icon: FileBarChart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Laporan & Analitik</h1>
        <p className="text-slate-500 text-sm">Generate dan unduh laporan keuangan serta aktivitas lembaga.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-colors group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-primary-light group-hover:text-primary rounded-xl flex items-center justify-center transition-colors">
                <report.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{report.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{report.desc}</p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="flex items-center gap-2 text-xs font-bold text-primary bg-primary-light px-3 py-1.5 rounded-lg">
                    <Calendar size={14} /> Pilih Periode
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
