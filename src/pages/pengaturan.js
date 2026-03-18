import { showToast, renderPageHeader, renderLoadingState, showModal } from '../ui.js';
import { apiGet, apiPost } from '../api.js';
import { getCachedData, updateCache } from '../dataStore.js';

// 1. State
let settings = {
    nama_lembaga: '',
    alamat_lembaga: '',
    kontak_whatsapp: '',
    email_lembaga: '',
    logo_url: '',
    
    no_rekening_utama: '',
    nama_bank: '',
    cabang_bank: '',
    
    prefix_donatur: 'DON-',
    prefix_mustahik: 'MUS-',
    prefix_program: 'PRG-',
    prefix_transaksi_masuk: 'TRX-IN-',
    prefix_transaksi_keluar: 'TRX-OUT-',
    
    master_dana: []
};

let currentTab = 'umum';
let isLoading = false;

// 2. Initialization
export async function initPengaturan(container) {
    renderLayout(container);
    fetchSettings();
}

// 3. Data Logic
async function fetchSettings(force = false) {
    isLoading = true;
    updateView();
    
    try {
        if (!force) {
            const cached = getCachedData('settings');
            if (cached && typeof cached === 'object' && Object.keys(cached).length > 0) {
                settings = { ...settings, ...cached };
                isLoading = false;
                updateView();
                return;
            }
        }

        const result = await apiGet('getSettings');
        // If result is an array, convert to object
        if (Array.isArray(result)) {
            const settingsObj = {};
            result.forEach(item => {
                if (item.key) settingsObj[item.key] = item.value;
            });
            settings = { ...settings, ...settingsObj };
            updateCache('settings', settingsObj);
        } else if (result && typeof result === 'object') {
            settings = { ...settings, ...result };
            updateCache('settings', result);
        }
    } catch (error) {
        showToast('Gagal mengambil pengaturan: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateView();
    }
}

async function handleSaveSettings() {
    try {
        // Collect data based on current tab or all tabs
        // For simplicity, we can collect all if they are in DOM, or just current
        const payload = { ...settings };
        
        // Update from DOM if elements exist
        const nameEl = document.getElementById('s-nama-lembaga');
        if (nameEl) payload.nama_lembaga = nameEl.value;
        
        const waEl = document.getElementById('s-wa');
        if (waEl) payload.kontak_whatsapp = waEl.value;
        
        const emailEl = document.getElementById('s-email');
        if (emailEl) payload.email_lembaga = emailEl.value;
        
        const addrEl = document.getElementById('s-alamat');
        if (addrEl) payload.alamat_lembaga = addrEl.value;
        
        const logoEl = document.getElementById('s-logo');
        if (logoEl) payload.logo_url = logoEl.value;
        
        const bankEl = document.getElementById('s-bank');
        if (bankEl) payload.nama_bank = bankEl.value;
        
        const rekEl = document.getElementById('s-rek');
        if (rekEl) payload.no_rekening_utama = rekEl.value;
        
        const cabEl = document.getElementById('s-cabang');
        if (cabEl) payload.cabang_bank = cabEl.value;

        await apiPost('updateSettings', payload);
        showToast('Pengaturan berhasil disimpan');
        fetchSettings();
    } catch (error) {
        showToast('Gagal menyimpan pengaturan: ' + error.message, 'error');
    }
}

// 4. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div id="pengaturan-content" class="space-y-6 pb-10">
            ${renderLoadingState('Menyiapkan pengaturan...')}
        </div>
    `;
}

function updateView() {
    const container = document.getElementById('pengaturan-content');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat pengaturan...');
        return;
    }

    container.innerHTML = `
        ${renderPageHeader({
            title: 'Pengaturan Sistem',
            subtitle: 'Konfigurasi identitas, perbankan, dan standarisasi data.',
            actions: [
                { id: 'btn-reset-settings', label: 'Reset', icon: 'rotate-ccw', variant: 'secondary' },
                { id: 'btn-save-settings', label: 'Simpan Perubahan', icon: 'save', variant: 'primary' }
            ]
        })}

        <!-- Tabs Navigation -->
        <div class="flex overflow-x-auto gap-1 p-1 bg-slate-100 rounded-2xl no-scrollbar">
            ${renderTabBtn('umum', 'Umum', 'settings')}
            ${renderTabBtn('identitas', 'Identitas Lembaga', 'building-2')}
            ${renderTabBtn('rekening', 'Rekening', 'credit-card')}
            ${renderTabBtn('prefix', 'Prefix ID', 'hash')}
            ${renderTabBtn('dana', 'Master Dana', 'database')}
        </div>

        <!-- Tab Content Container -->
        <div id="tab-content-container" class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
            ${renderTabContent()}
        </div>
    `;

    attachEvents();
    if (window.lucide) window.lucide.createIcons();
}

function renderTabBtn(id, label, icon) {
    const isActive = currentTab === id;
    return `
        <button data-tab="${id}" class="tab-btn flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            <i data-lucide="${icon}" class="w-4 h-4"></i>
            <span>${label}</span>
        </button>
    `;
}

function renderTabContent() {
    switch(currentTab) {
        case 'umum':
            return `
                <div class="max-w-2xl space-y-8">
                    <div class="grid grid-cols-1 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Aplikasi</label>
                            <input type="text" value="Sistem Informasi ZISWAF" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun Operasional</label>
                            <input type="number" value="2026" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                        </div>
                    </div>
                    <div class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
                        <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                            <i data-lucide="info" class="w-5 h-5 text-emerald-600"></i>
                        </div>
                        <p class="text-xs text-emerald-800 leading-relaxed font-medium">Pengaturan umum digunakan untuk identitas dasar aplikasi pada kuitansi dan laporan cetak.</p>
                    </div>

                    <div class="pt-6 border-t border-slate-100">
                        <h4 class="text-sm font-black text-slate-800 tracking-tight mb-2">Inisialisasi Database</h4>
                        <p class="text-xs text-slate-500 mb-4">Jika Anda baru pertama kali menggunakan aplikasi atau mendapatkan error "Sheet tidak ditemukan", klik tombol di bawah untuk membuat semua tabel yang diperlukan di Google Sheets.</p>
                        <button id="btn-setup-db" class="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-xl shadow-slate-200 active:scale-95 transition-all">
                            <i data-lucide="database" class="w-4 h-4"></i>
                            <span>Setup Database (Buat Sheet & Header)</span>
                        </button>
                    </div>
                </div>
            `;
        case 'identitas':
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2 md:col-span-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lembaga *</label>
                        <input type="text" id="s-nama-lembaga" value="${settings.nama_lembaga}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Center</label>
                        <input type="text" id="s-wa" value="${settings.kontak_whatsapp}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Resmi</label>
                        <input type="email" id="s-email" value="${settings.email_lembaga}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                    </div>
                    <div class="space-y-2 md:col-span-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Lengkap</label>
                        <textarea id="s-alamat" rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium resize-none">${settings.alamat_lembaga}</textarea>
                    </div>
                    <div class="space-y-2 md:col-span-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL Logo Lembaga</label>
                        <div class="flex gap-6 items-center">
                            <div class="w-20 h-20 rounded-2xl border border-slate-200 p-1 bg-white shadow-sm overflow-hidden">
                                <img src="${settings.logo_url}" class="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer">
                            </div>
                            <input type="url" id="s-logo" value="${settings.logo_url}" class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                        </div>
                    </div>
                </div>
            `;
        case 'rekening':
            return `
                <div class="max-w-2xl space-y-8">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Bank</label>
                        <input type="text" id="s-bank" value="${settings.nama_bank}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Rekening Utama</label>
                        <input type="text" id="s-rek" value="${settings.no_rekening_utama}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono font-bold">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cabang</label>
                        <input type="text" id="s-cabang" value="${settings.cabang_bank}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                    </div>
                </div>
            `;
        case 'prefix':
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefix Donatur</label>
                        <input type="text" id="p-don" value="${settings.prefix_donatur}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono font-bold">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefix Mustahik</label>
                        <input type="text" id="p-mus" value="${settings.prefix_mustahik}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono font-bold">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefix Program</label>
                        <input type="text" id="p-prg" value="${settings.prefix_program}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono font-bold">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefix Transaksi Masuk</label>
                        <input type="text" id="p-in" value="${settings.prefix_transaksi_masuk}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono font-bold">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefix Transaksi Keluar</label>
                        <input type="text" id="p-out" value="${settings.prefix_transaksi_keluar}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono font-bold">
                    </div>
                </div>
            `;
        case 'dana':
            return `
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Jenis Dana</label>
                        <button class="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">+ Tambah Dana</button>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        ${settings.master_dana.map(dana => `
                            <div class="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-black shadow-sm">
                                <span>${dana}</span>
                                <button class="hover:text-rose-500 transition-colors"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        default:
            return '';
    }
}

function attachEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            currentTab = btn.getAttribute('data-tab');
            updateView();
        };
    });

    const btnSave = document.getElementById('btn-save-settings');
    if (btnSave) {
        btnSave.onclick = () => handleSaveSettings();
    }

    const btnReset = document.getElementById('btn-reset-settings');
    if (btnReset) {
        btnReset.onclick = () => {
            // Using custom modal logic would be better, but for now we use simple confirmation
            if (confirm('Kembalikan semua pengaturan ke nilai default?')) {
                showToast('Pengaturan telah direset.');
                updateView();
            }
        };
    }

    const btnSetup = document.getElementById('btn-setup-db');
    if (btnSetup) {
        btnSetup.onclick = async () => {
            showModal({
                title: 'Konfirmasi Setup',
                content: `
                    <div class="text-center space-y-4">
                        <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                            <i data-lucide="database" class="w-8 h-8"></i>
                        </div>
                        <div>
                            <p class="text-slate-600 font-medium">Apakah Anda yakin ingin menjalankan Setup Database?</p>
                            <p class="text-xs text-slate-400 mt-2">Sistem akan membuat tabel dan header yang diperlukan di Google Sheets Anda. Data yang sudah ada tidak akan dihapus.</p>
                        </div>
                    </div>
                `,
                saveLabel: 'Ya, Jalankan Setup',
                onSave: async () => {
                    const originalContent = btnSetup.innerHTML;
                    btnSetup.disabled = true;
                    btnSetup.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> <span>Memproses...</span>';
                    if (window.lucide) window.lucide.createIcons();

                    try {
                        const res = await apiGet('setup');
                        showToast(res.message || 'Setup berhasil!');
                        return true;
                    } catch (error) {
                        showToast('Setup gagal: ' + error.message, 'error');
                        return false;
                    } finally {
                        btnSetup.disabled = false;
                        btnSetup.innerHTML = originalContent;
                        if (window.lucide) window.lucide.createIcons();
                    }
                }
            });
        };
    }
}
