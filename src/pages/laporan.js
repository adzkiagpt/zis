import { renderTable, showToast, renderPageHeader, renderLoadingState, renderBadge, showModal } from '../ui.js';
import { formatDate, formatIDR } from '../utils.js';
import { apiGet } from '../api.js';

// 1. State
let currentReportType = 'penerimaan';
let isLoading = false;
let reportData = null;

// 2. Initialization
export async function initLaporan(container) {
    renderLayout(container);
    fetchData();
}

// 3. Data Logic
async function fetchData() {
    isLoading = true;
    updateReportView();
    
    try {
        const result = await apiGet('getReportData');
        reportData = result;
    } catch (error) {
        showToast('Gagal mengambil data laporan: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateReportView();
    }
}

// 4. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div id="laporan-content" class="space-y-6 pb-10">
            ${renderLoadingState('Menyiapkan pusat laporan...')}
        </div>
    `;
}

function updateReportView() {
    const container = document.getElementById('laporan-content');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data laporan...');
        return;
    }

    container.innerHTML = `
        ${renderPageHeader({
            title: 'Pusat Laporan',
            subtitle: 'Analisis data keuangan dan operasional ZISWAF.',
            actions: [
                { id: 'btn-refresh-report', label: 'Refresh', icon: 'refresh-cw', className: 'flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm transition-all' },
                { id: 'btn-export-excel', label: 'Excel', icon: 'file-spreadsheet', className: 'flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm transition-all' },
                { id: 'btn-export-pdf', label: 'PDF', icon: 'file-text', className: 'flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm transition-all' }
            ]
        })}

        <!-- Sub Menu Tabs -->
        <div class="flex overflow-x-auto gap-1 p-1 bg-slate-100 rounded-2xl no-scrollbar">
            ${renderTabButton('penerimaan', 'Penerimaan', 'arrow-down-circle')}
            ${renderTabButton('penyaluran', 'Penyaluran', 'arrow-up-circle')}
            ${renderTabButton('saldo', 'Saldo Dana', 'wallet')}
            ${renderTabButton('donatur', 'Donatur', 'users')}
            ${renderTabButton('mustahik', 'Mustahik', 'user-round')}
            ${renderTabButton('program', 'Program', 'target')}
        </div>

        <!-- Filter Section -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase">Rentang Tanggal</label>
                <div class="flex items-center gap-2">
                    <input type="date" id="filter-start-date" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none">
                    <span class="text-slate-400">-</span>
                    <input type="date" id="filter-end-date" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none">
                </div>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase">Jenis Dana</label>
                <select id="filter-fund-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none">
                    <option value="">Semua Dana</option>
                    ${(reportData?.saldo || []).map(b => `<option value="${b.fund}">${b.fund}</option>`).join('')}
                </select>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase">Program</label>
                <select id="filter-program" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none">
                    <option value="">Semua Program</option>
                    ${renderProgramOptions()}
                </select>
            </div>
            <div class="flex items-end">
                <button id="btn-show-report" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95">
                    Tampilkan Laporan
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div id="report-summary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${renderSummary()}
        </div>

        <!-- Table Section -->
        <div id="report-table-container" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            ${renderReportTable()}
        </div>
    `;

    attachEvents();
    if (window.lucide) window.lucide.createIcons();
}

function renderTabButton(id, label, icon) {
    const isActive = currentReportType === id;
    return `
        <button data-report="${id}" class="tab-btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            <i data-lucide="${icon}" class="w-4 h-4"></i>
            <span>${label}</span>
        </button>
    `;
}

function renderProgramOptions() {
    if (!reportData || !reportData.program) return '';
    return reportData.program.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
}

function getFilteredData() {
    if (!reportData) return [];
    let data = reportData[currentReportType] || [];
    
    if (!Array.isArray(data)) return [];

    const startDate = document.getElementById('filter-start-date')?.value;
    const endDate = document.getElementById('filter-end-date')?.value;
    const fundType = document.getElementById('filter-fund-type')?.value;
    const program = document.getElementById('filter-program')?.value;

    return data.filter(item => {
        let match = true;
        
        // Date filter
        if (item.date && (startDate || endDate)) {
            const itemDate = new Date(item.date);
            if (startDate && itemDate < new Date(startDate)) match = false;
            if (endDate && itemDate > new Date(endDate)) match = false;
        }

        // Fund Type filter
        if (fundType && item.fund !== fundType) match = false;

        // Program filter
        if (program && item.program !== program) match = false;

        return match;
    });
}

function renderSummary() {
    if (!reportData) return '';
    const data = getFilteredData();
    
    if (currentReportType === 'penerimaan' || currentReportType === 'penyaluran') {
        const total = Array.isArray(data) ? data.reduce((acc, curr) => acc + (curr.amount || 0), 0) : 0;
        return `
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Nominal</p>
                <p class="text-xl font-black text-slate-800">${formatIDR(total)}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Jumlah Transaksi</p>
                <p class="text-xl font-black text-slate-800">${Array.isArray(data) ? data.length : 0}</p>
            </div>
        `;
    } else if (currentReportType === 'saldo') {
        const totalBalance = Array.isArray(data) ? data.reduce((acc, curr) => acc + (curr.balance || 0), 0) : 0;
        return `
            <div class="bg-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-100">
                <p class="text-[10px] font-bold text-emerald-100 uppercase mb-1">Total Saldo Konsolidasi</p>
                <p class="text-xl font-black text-white">${formatIDR(totalBalance)}</p>
            </div>
        `;
    }
    return '';
}

function renderReportTable() {
    if (!reportData) return '';
    const data = getFilteredData();

    if (!Array.isArray(data)) {
        return `<div class="p-20 text-center text-slate-400 font-medium italic">Format data tidak valid untuk kategori ini.</div>`;
    }

    if (data.length === 0) {
        return `<div class="p-20 text-center text-slate-400 font-medium italic">Tidak ada data untuk ditampilkan.</div>`;
    }

    switch(currentReportType) {
        case 'penerimaan':
            return renderTable({
                headers: ['Tanggal', 'Donatur', 'Jenis Dana', 'Program', 'Nominal', 'Status'],
                data,
                renderRow: (item) => `
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td class="px-6 py-4 text-sm text-slate-500 font-medium">${formatDate(item.date)}</td>
                        <td class="px-6 py-4 text-sm font-bold text-slate-800">${item.name}</td>
                        <td class="px-6 py-4 text-sm text-emerald-600 font-bold">${item.fund}</td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.program}</td>
                        <td class="px-6 py-4 text-sm font-black text-slate-800">${formatIDR(item.amount)}</td>
                        <td class="px-6 py-4 text-sm">
                            ${renderBadge(item.status)}
                        </td>
                    </tr>
                `
            });
        case 'penyaluran':
            return renderTable({
                headers: ['Tanggal', 'Mustahik', 'Asnaf', 'Jenis Dana', 'Nominal', 'Status'],
                data,
                renderRow: (item) => `
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td class="px-6 py-4 text-sm text-slate-500 font-medium">${formatDate(item.date)}</td>
                        <td class="px-6 py-4 text-sm font-bold text-slate-800">${item.name}</td>
                        <td class="px-6 py-4 text-sm text-blue-600 font-bold">${item.asnaf}</td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.fund}</td>
                        <td class="px-6 py-4 text-sm font-black text-slate-800">${formatIDR(item.amount)}</td>
                        <td class="px-6 py-4 text-sm">
                            ${renderBadge(item.status)}
                        </td>
                    </tr>
                `
            });
        case 'saldo':
            return renderTable({
                headers: ['Jenis Dana', 'Total Masuk', 'Total Keluar', 'Saldo Akhir'],
                data,
                renderRow: (item) => `
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td class="px-6 py-4 text-sm font-bold text-slate-800">${item.fund}</td>
                        <td class="px-6 py-4 text-sm text-emerald-600 font-bold">${formatIDR(item.totalIn)}</td>
                        <td class="px-6 py-4 text-sm text-rose-600 font-bold">${formatIDR(item.totalOut)}</td>
                        <td class="px-6 py-4 text-sm font-black text-slate-800">${formatIDR(item.balance)}</td>
                    </tr>
                `
            });
        case 'program':
            return renderTable({
                headers: ['Nama Program', 'Target', 'Realisasi Masuk', 'Realisasi Keluar', 'Progres'],
                data,
                renderRow: (item) => `
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td class="px-6 py-4 text-sm font-bold text-slate-800">${item.name}</td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">${formatIDR(item.target)}</td>
                        <td class="px-6 py-4 text-sm text-emerald-600 font-bold">${formatIDR(item.in)}</td>
                        <td class="px-6 py-4 text-sm text-rose-600 font-bold">${formatIDR(item.out)}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div class="h-full bg-emerald-500 rounded-full" style="width: ${item.progress}%"></div>
                                </div>
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">${item.progress}%</span>
                            </div>
                        </td>
                    </tr>
                `
            });
        case 'donatur':
            return renderTable({
                headers: ['Nama Lengkap', 'Email', 'No HP', 'Kategori', 'Total Donasi', 'Status', 'Aksi'],
                data,
                renderRow: (item) => `
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td class="px-6 py-4 text-sm font-bold text-slate-800">${item.nama_lengkap}</td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.email || '-'}</td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.no_hp || '-'}</td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.kategori || '-'}</td>
                        <td class="px-6 py-4 text-sm font-black text-slate-800">${formatIDR(item.total_donasi || 0)}</td>
                        <td class="px-6 py-4 text-sm">
                            ${renderBadge(item.status)}
                        </td>
                        <td class="px-6 py-4 text-sm">
                            <button class="btn-detail-donatur p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" data-id="${item.donatur_id}">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>
                `
            });
        case 'mustahik':
            return renderTable({
                headers: ['Nama Lengkap', 'NIK', 'Wilayah', 'Asnaf', 'Aksi'],
                data,
                renderRow: (item) => `
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td class="px-6 py-4">
                            <div class="font-bold text-slate-800">${item.nama_lengkap}</div>
                            <div class="text-[10px] text-slate-400 font-mono tracking-tighter">${item.no_hp || '-'}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-500 font-mono">${item.nik || '-'}</td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.wilayah || '-'}</td>
                        <td class="px-6 py-4 text-sm text-blue-600 font-bold">${item.asnaf}</td>
                        <td class="px-6 py-4 text-sm">
                            <button class="btn-detail-mustahik p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" data-id="${item.mustahik_id}">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>
                `
            });
        default:
            return `<div class="p-20 text-center text-slate-400 font-medium">Data laporan belum tersedia.</div>`;
    }
}

function attachEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            currentReportType = btn.getAttribute('data-report');
            updateReportView();
        };
    });

    document.querySelectorAll('.btn-detail-donatur').forEach(btn => {
        btn.onclick = (e) => {
            const id = btn.getAttribute('data-id');
            const donor = reportData.donatur.find(d => d.donatur_id === id);
            if (donor) showDonaturDetail(donor);
        };
    });

    document.querySelectorAll('.btn-detail-mustahik').forEach(btn => {
        btn.onclick = (e) => {
            const id = btn.getAttribute('data-id');
            const mustahik = reportData.mustahik.find(m => String(m.mustahik_id) === String(id));
            if (mustahik) showMustahikDetail(mustahik);
        };
    });

    const btnShow = document.getElementById('btn-show-report');
    if (btnShow) {
        btnShow.onclick = () => {
            updateReportView();
        };
    }

    const btnRefresh = document.getElementById('btn-refresh-report');
    if (btnRefresh) {
        btnRefresh.onclick = () => {
            showToast('Mengambil data terbaru dari server...');
            fetchData();
        };
    }

    const btnExcel = document.getElementById('btn-export-excel');
    if (btnExcel) btnExcel.onclick = () => showToast('Mengekspor ke Excel...');

    const btnPdf = document.getElementById('btn-export-pdf');
    if (btnPdf) btnPdf.onclick = () => showToast('Menyiapkan file PDF...');
}

function showDonaturDetail(donor) {
    // Filter donations for this donor
    const donations = reportData.penerimaan.filter(p => p.donatur_id === donor.donatur_id);

    const content = `
        <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">ID Donatur</p>
                    <p class="text-sm font-bold text-slate-800">${donor.donatur_id}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</p>
                    <p class="text-sm font-bold text-slate-800">${donor.nama_lengkap}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Nomor Telepon</p>
                    <p class="text-sm font-bold text-slate-800">${donor.no_hp || '-'}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Total Donasi</p>
                    <p class="text-sm font-black text-emerald-600">${formatIDR(donor.total_donasi || 0)}</p>
                </div>
            </div>

            <div class="space-y-3">
                <h4 class="text-sm font-black text-slate-800 flex items-center gap-2">
                    <i data-lucide="history" class="w-4 h-4 text-emerald-600"></i>
                    Riwayat Donasi
                </h4>
                <div class="border border-slate-100 rounded-xl overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th class="px-4 py-3">Tanggal</th>
                                <th class="px-4 py-3">Program</th>
                                <th class="px-4 py-3 text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${donations.length > 0 ? donations.map(d => `
                                <tr>
                                    <td class="px-4 py-3 text-xs text-slate-500 font-medium">${formatDate(d.date)}</td>
                                    <td class="px-4 py-3 text-xs text-slate-800 font-bold">${d.program}</td>
                                    <td class="px-4 py-3 text-xs text-slate-800 font-black text-right">${formatIDR(d.amount)}</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="3" class="px-4 py-8 text-center text-xs text-slate-400 italic">Belum ada riwayat donasi.</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    showModal({
        title: 'Detail Donatur',
        content,
        saveLabel: 'Tutup',
        saveClass: 'bg-slate-800 hover:bg-slate-900',
        onSave: () => true
    });
}

function showMustahikDetail(mustahik) {
    // Filter assistance for this mustahik
    const mustahikId = String(mustahik.mustahik_id || '').trim();
    const mustahikName = String(mustahik.nama_lengkap || '').trim();
    
    const penyaluran = Array.isArray(reportData?.penyaluran) ? reportData.penyaluran : [];
    
    const assistance = penyaluran.filter(p => {
        const pId = String(p.mustahik_id || '').trim();
        const pName = String(p.name || '').trim().toLowerCase();
        const mName = mustahikName.toLowerCase();
        
        // Match by ID if available, otherwise fallback to name for old data
        if (pId && mustahikId) return pId === mustahikId;
        return pName === mName && mName !== '';
    });

    const content = `
        <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">ID Mustahik</p>
                    <p class="text-sm font-bold text-slate-800">${mustahik.mustahik_id}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</p>
                    <p class="text-sm font-bold text-slate-800">${mustahik.nama_lengkap}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">NIK</p>
                    <p class="text-sm font-bold text-slate-800">${mustahik.nik || '-'}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Asnaf</p>
                    <p class="text-sm font-bold text-blue-600">${mustahik.asnaf}</p>
                </div>
            </div>

            <div class="space-y-3">
                <h4 class="text-sm font-black text-slate-800 flex items-center gap-2">
                    <i data-lucide="history" class="w-4 h-4 text-blue-600"></i>
                    Riwayat Bantuan
                </h4>
                <div class="border border-slate-100 rounded-xl overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th class="px-4 py-3">Tanggal</th>
                                <th class="px-4 py-3">Jenis Dana</th>
                                <th class="px-4 py-3 text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${assistance.length > 0 ? assistance.map(a => `
                                <tr>
                                    <td class="px-4 py-3 text-xs text-slate-500 font-medium">${formatDate(a.date)}</td>
                                    <td class="px-4 py-3 text-xs text-slate-800 font-bold">${a.fund}</td>
                                    <td class="px-4 py-3 text-xs text-slate-800 font-black text-right">${formatIDR(a.amount)}</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="3" class="px-4 py-8 text-center text-xs text-slate-400 italic">Belum ada riwayat bantuan.</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    showModal({
        title: 'Detail Mustahik',
        content,
        saveLabel: 'Tutup',
        saveClass: 'bg-slate-800 hover:bg-slate-900',
        onSave: () => true
    });
}
