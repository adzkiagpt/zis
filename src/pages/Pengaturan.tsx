import React from 'react';
import { Save, Building2, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Pengaturan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
        <p className="text-slate-500 text-sm">Konfigurasi identitas lembaga dan parameter aplikasi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profil Lembaga */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-primary" /> Profil Lembaga
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Nama Lembaga</label>
                <input type="text" defaultValue="LAZIS Modern Indonesia" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Email Resmi</label>
                <input type="email" defaultValue="info@lazismodern.org" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">No. Telepon</label>
                <input type="text" defaultValue="021-1234567" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Website</label>
                <input type="text" defaultValue="www.lazismodern.org" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Alamat Kantor Pusat</label>
                <textarea rows={3} defaultValue="Jl. Raya Kebagusan No. 123, Jakarta Selatan" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"></textarea>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-100">
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo Lembaga */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <h3 className="font-bold text-slate-800 mb-6">Logo Lembaga</h3>
            <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl mx-auto flex items-center justify-center mb-4 overflow-hidden">
              <img src="https://picsum.photos/seed/logo/200/200" alt="Logo" className="w-full h-full object-cover opacity-50" />
            </div>
            <button className="text-primary text-sm font-bold hover:underline">Ganti Logo</button>
            <p className="text-[10px] text-slate-400 mt-2">Format: PNG, JPG (Max 2MB)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
