import { renderBadge, renderTable, showModal, showToast, renderPageHeader, renderEmptyState, renderLoadingState } from '../ui.js';
import { formatDate, formatIDR } from '../utils.js';
import { apiGet, apiPost } from '../api.js';
import { getCachedData, ensureInitialData } from '../dataStore.js';

// 1. Master Data
let masterDonors = getCachedData('donatur') || [];
let masterPrograms = getCachedData('program') || [];

// 2. State & Data
let transactions = [];
let isLoading = false;

// 3. Initialization
export function initTrxMasuk(container) {
    renderLayout(container);
    fetchData();
}

// 4. Data Logic
async function fetchData() {
    isLoading = true;
    updateTableView();
    
    try {
        // Pastikan data awal tersedia
        const cached = await ensureInitialData();
        masterDonors = cached.donatur || [];
        masterPrograms = cached.program || [];
        
        // Ambil data transaksi
        const trxRes = await apiGet('getTrxMasuk');
        transactions = Array.isArray(trxRes) ? trxRes : [];
    } catch (error) {
        showToast('Gagal mengambil data: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateTableView();
    }
}

async function handleSave(data, isEdit) {
    try {
        const action = isEdit ? 'updateTrxMasuk' : 'addTrxMasuk';
        await apiPost(action, data);
        showToast(isEdit ? 'Transaksi diperbarui' : 'Transaksi donasi dicatat');
        fetchData();
        return true;
    } catch (error) {
        showToast('Gagal menyimpan: ' + error.message, 'error');
        return false;
    }
}

async function handleDelete(id, donorName) {
    showModal({
        title: 'Konfirmasi Hapus',
        content: `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <i data-lucide="trash-2" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-slate-600">Hapus catatan transaksi dari <span class="font-black text-slate-800">${donorName}</span>?</p>
                    <p class="text-xs text-slate-400 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
            </div>
        `,
        saveLabel: 'Ya, Hapus',
        saveClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
        onSave: async () => {
            try {
                await apiPost('deleteTrxMasuk', { id });
                showToast('Transaksi berhasil dihapus');
                fetchData();
                return true;
            } catch (error) {
                showToast('Gagal menghapus: ' + error.message, 'error');
                return false;
            }
        }
    });
    if (window.lucide) window.lucide.createIcons();
}

async function handleVerify(trx) {
    if (trx.status === 'Terverifikasi') {
        showToast('Transaksi sudah terverifikasi', 'error');
        return;
    }
    
    showModal({
        title: 'Verifikasi Transaksi',
        content: `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <i data-lucide="check-circle" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-slate-600">Verifikasi transaksi dari <span class="font-black text-slate-800">${trx.nama_donatur}</span>?</p>
                    <p class="text-lg font-black text-emerald-600 mt-1">${formatIDR(trx.nominal)}</p>
                </div>
            </div>
        `,
        saveLabel: 'Verifikasi Sekarang',
        saveClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
        onSave: async () => {
            try {
                await apiPost('updateTrxMasukStatus', { id: trx.transaksi_id, status: 'Terverifikasi' });
                showToast('Transaksi berhasil diverifikasi');
                fetchData();
                return true;
            } catch (error) {
                showToast('Gagal verifikasi: ' + error.message, 'error');
                return false;
            }
        }
    });
    if (window.lucide) window.lucide.createIcons();
}

// 5. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div class="space-y-6 pb-10">
            <div id="trx-in-header"></div>

            <!-- Filter Bar -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                    <input type="text" id="search-trx" placeholder="Cari donatur atau ID transaksi..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm">
                </div>
                <div class="flex flex-wrap gap-2">
                    <input type="date" id="filter-date" class="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 outline-none">
                    <select id="filter-fund" class="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 outline-none">
                        <option value="">Semua Dana</option>
                        <option value="Zakat">Zakat</option>
                        <option value="Infaq">Infaq</option>
                        <option value="Wakaf">Wakaf</option>
                    </select>
                    <select id="filter-status-trx" class="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 outline-none">
                        <option value="">Semua Status</option>
                        <option value="Terverifikasi">Terverifikasi</option>
                        <option value="Menunggu">Menunggu</option>
                    </select>
                </div>
            </div>

            <!-- Table Container -->
            <div id="trx-table-container" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]"></div>
        </div>
    `;

    renderHeader();
    attachEvents();
}

function renderHeader() {
    const headerContainer = document.getElementById('trx-in-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = renderPageHeader({
        title: 'Transaksi Masuk',
        subtitle: 'Pencatatan dan verifikasi seluruh dana donasi yang masuk.',
        actions: [
            {
                id: 'btn-add-trx',
                label: 'Input Donasi',
                icon: 'plus-circle'
            }
        ]
    });

    const addBtn = document.getElementById('btn-add-trx');
    if (addBtn) {
        addBtn.onclick = () => openFormModal();
    }
}

function updateTableView() {
    const container = document.getElementById('trx-table-container');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data transaksi...');
        return;
    }

    const searchTerm = document.getElementById('search-trx')?.value.toLowerCase() || '';
    const fundFilter = document.getElementById('filter-fund')?.value || '';
    const statusFilter = document.getElementById('filter-status-trx')?.value || '';
    const dateFilter = document.getElementById('filter-date')?.value || '';

    const filteredData = transactions.filter(t => {
        const matchesSearch = (t.nama_donatur || '').toLowerCase().includes(searchTerm) || (t.transaksi_id || '').toLowerCase().includes(searchTerm);
        const matchesFund = fundFilter === '' || t.fund_type === fundFilter;
        const matchesStatus = statusFilter === '' || t.status === statusFilter;
        const matchesDate = dateFilter === '' || t.tanggal === dateFilter;
        return matchesSearch && matchesFund && matchesStatus && matchesDate;
    });

    if (filteredData.length === 0) {
        container.innerHTML = renderEmptyState('Transaksi tidak ditemukan', 'Coba ubah filter atau cari dengan kata kunci lain.');
        return;
    }

    container.innerHTML = renderTable({
        headers: ['Tanggal', 'Donatur', 'Dana / Program', 'Nominal', 'Status', 'Aksi'],
        data: filteredData,
        renderRow: (item) => {
            const program = masterPrograms.find(p => p.program_id === item.program_id);
            const programName = program ? program.nama_program : 'Umum';

            return `
            <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-4 py-4 text-sm text-slate-500">${formatDate(item.tanggal)}</td>
                <td class="px-4 py-4">
                    <div class="font-bold text-slate-800">${item.nama_donatur}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${item.transaksi_id}</div>
                </td>
                <td class="px-4 py-4">
                    <div class="text-xs font-bold text-emerald-600">${item.fund_type}</div>
                    <div class="text-xs text-slate-500">${programName}</div>
                </td>
                <td class="px-4 py-4 text-sm font-black text-slate-800">${formatIDR(item.nominal)}</td>
                <td class="px-4 py-4">${renderBadge(item.status)}</td>
                <td class="px-4 py-4">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.handleTrxAction('print', '${item.transaksi_id}')" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors" title="Cetak Kuitansi"><i data-lucide="printer" class="w-4 h-4"></i></button>
                        <button onclick="window.handleTrxAction('verify', '${item.transaksi_id}')" class="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Verifikasi"><i data-lucide="check-square" class="w-4 h-4"></i></button>
                        <button onclick="window.handleTrxAction('edit', '${item.transaksi_id}')" class="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button onclick="window.handleTrxAction('delete', '${item.transaksi_id}')" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `;
        }
    });

    if (window.lucide) window.lucide.createIcons();
}

function attachEvents() {
    document.getElementById('search-trx')?.addEventListener('input', updateTableView);
    document.getElementById('filter-fund')?.addEventListener('change', updateTableView);
    document.getElementById('filter-status-trx')?.addEventListener('change', updateTableView);
    document.getElementById('filter-date')?.addEventListener('change', updateTableView);

    window.handleTrxAction = (action, id) => {
        const trx = transactions.find(t => t.transaksi_id === id);
        if (!trx) return;

        switch(action) {
            case 'edit': openFormModal(trx); break;
            case 'verify': handleVerify(trx); break;
            case 'print': handlePrint(trx); break;
            case 'delete': handleDelete(id, trx.nama_donatur); break;
        }
    };
}

function openFormModal(trx = null) {
    const isEdit = !!trx;
    const fundTypes = getCachedData('balance') || [];
    
    showModal({
        title: isEdit ? 'Edit Transaksi Masuk' : 'Input Transaksi Donasi',
        content: `
            <form id="form-trx" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Tanggal Transaksi *</label>
                    <input type="date" id="t-date" value="${trx?.tanggal || new Date().toISOString().split('T')[0]}" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Donatur *</label>
                    <select id="t-donor" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="">Pilih Donatur</option>
                        ${masterDonors.map(d => `<option value="${d.donatur_id}" ${trx?.donatur_id === d.donatur_id ? 'selected' : ''}>${d.nama_lengkap}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Jenis Dana *</label>
                    <select id="t-fund" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="">Pilih Jenis</option>
                        ${fundTypes.map(f => `<option value="${f.fund}" ${trx?.fund_type === f.fund ? 'selected' : ''}>${f.fund}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Program ZISWAF</label>
                    <select id="t-program" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="">Pilih Program</option>
                        <!-- Akan diisi secara dinamis -->
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Nominal (Rp) *</label>
                    <input type="number" id="t-amount" value="${trx?.nominal || ''}" required min="1" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-emerald-600">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran</label>
                    <select id="t-method" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Transfer Bank" ${trx?.metode === 'Transfer Bank' ? 'selected' : ''}>Transfer Bank</option>
                        <option value="Tunai" ${trx?.metode === 'Tunai' ? 'selected' : ''}>Tunai</option>
                        <option value="QRIS" ${trx?.metode === 'QRIS' ? 'selected' : ''}>QRIS</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Status Verifikasi</label>
                    <select id="t-status" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Menunggu" ${trx?.status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
                        <option value="Terverifikasi" ${trx?.status === 'Terverifikasi' ? 'selected' : ''}>Terverifikasi</option>
                    </select>
                </div>
                <div class="space-y-1 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Keterangan / Akad</label>
                    <textarea id="t-note" rows="2" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none">${trx?.note || ''}</textarea>
                </div>
            </form>
        `,
        onSave: () => {
            const date = document.getElementById('t-date').value;
            const donorId = document.getElementById('t-donor').value;
            const fundType = document.getElementById('t-fund').value;
            const amount = document.getElementById('t-amount').value;

            if (!date || !donorId || !fundType || !amount || amount <= 0) {
                showToast('Lengkapi data dengan benar (Nominal > 0)!', 'error');
                return false;
            }

            const donor = masterDonors.find(d => d.donatur_id === donorId);
            const program = masterPrograms.find(p => p.program_id === document.getElementById('t-program').value);

            const data = {
                transaksi_id: trx?.transaksi_id,
                tanggal: date,
                donatur_id: donorId,
                nama_donatur: donor?.nama_lengkap || 'Unknown',
                fund_type: fundType,
                program_id: program?.program_id || '-',
                nominal: parseInt(amount),
                metode: document.getElementById('t-method').value,
                status: document.getElementById('t-status').value,
                keterangan: document.getElementById('t-note').value
            };

            return handleSave(data, isEdit);
        }
    });

    // Handle Dynamic Program Loading
    const fundSelect = document.getElementById('t-fund');
    const programSelect = document.getElementById('t-program');

    const updatePrograms = (fundType) => {
        const filtered = masterPrograms.filter(p => p.jenis_dana === fundType || p.fundType === fundType);
        programSelect.innerHTML = `
            <option value="">Pilih Program (Opsional)</option>
            ${filtered.map(p => `<option value="${p.program_id}" ${trx?.program_id === p.program_id ? 'selected' : ''}>${p.nama_program}</option>`).join('')}
        `;
    };

    fundSelect.onchange = (e) => updatePrograms(e.target.value);
    
    // Initial load
    if (fundSelect.value) {
        updatePrograms(fundSelect.value);
    }
}

function handlePrint(trx) {
    showModal({
        title: 'Kuitansi Digital',
        content: `
            <div class="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-6 font-mono text-sm">
                <div class="text-center border-b border-slate-100 pb-4">
                    <h2 class="text-xl font-black text-emerald-600">KUITANSI ZISWAF</h2>
                    <p class="text-[10px] text-slate-400">No: ${trx.id}</p>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between"><span>Tanggal</span><span>${formatDate(trx.date)}</span></div>
                    <div class="flex justify-between"><span>Donatur</span><span class="font-bold">${trx.donorName}</span></div>
                    <div class="flex justify-between"><span>Jenis Dana</span><span>${trx.fundType}</span></div>
                    <div class="flex justify-between"><span>Program</span><span>${trx.programName}</span></div>
                </div>
                <div class="py-4 border-y border-slate-100 text-center">
                    <p class="text-[10px] text-slate-400 mb-1">Jumlah Donasi</p>
                    <p class="text-2xl font-black text-slate-800">${formatIDR(trx.amount)}</p>
                </div>
                <div class="text-[10px] text-slate-400 italic text-center">
                    "Semoga Allah memberikan pahala atas apa yang engkau berikan, dan menjadikannya pembersih bagimu."
                </div>
                <div class="flex justify-end pt-4">
                    <div class="text-center">
                        <p class="text-[10px] mb-8">Petugas,</p>
                        <p class="font-bold border-t border-slate-800 pt-1">${trx.inputBy}</p>
                    </div>
                </div>
            </div>
        `,
        onSave: () => {
            window.print();
            return true;
        }
    });
}

