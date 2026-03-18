import { renderBadge, renderTable, showModal, showToast, renderPageHeader, renderEmptyState, renderLoadingState } from '../ui.js';
import { formatDate, formatIDR } from '../utils.js';
import { apiGet, apiPost } from '../api.js';
import { getCachedData, ensureInitialData } from '../dataStore.js';

// 1. Master Data
let masterMustahik = getCachedData('mustahik') || [];
let masterPrograms = getCachedData('program') || [];
let availableBalance = {};

// Normalize balance from cache
const cachedBalance = getCachedData('balance');
if (Array.isArray(cachedBalance)) {
    cachedBalance.forEach(b => {
        if (b.fund) availableBalance[b.fund] = b.balance;
    });
}

// 2. State & Data
let transactionsOut = [];
let isLoading = false;

// 3. Initialization
export function initTrxKeluar(container) {
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
        masterMustahik = cached.mustahik || [];
        masterPrograms = cached.program || [];
        const balRes = cached.balance;
        if (Array.isArray(balRes)) {
            balRes.forEach(b => {
                if (b.fund) availableBalance[b.fund] = b.balance;
            });
        } else if (balRes && typeof balRes === 'object') {
            availableBalance = { ...availableBalance, ...balRes };
        }
        
        // Ambil data transaksi
        const trxRes = await apiGet('getTrxKeluar');
        transactionsOut = Array.isArray(trxRes) ? trxRes : [];
    } catch (error) {
        showToast('Gagal mengambil data: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateTableView();
    }
}

async function handleSave(data, isEdit) {
    try {
        const action = isEdit ? 'updateTrxKeluar' : 'addTrxKeluar';
        await apiPost(action, data);
        showToast(isEdit ? 'Penyaluran diperbarui' : 'Penyaluran dana dicatat');
        fetchData();
        return true;
    } catch (error) {
        showToast('Gagal menyimpan: ' + error.message, 'error');
        return false;
    }
}

async function handleDelete(id, receiverName) {
    showModal({
        title: 'Konfirmasi Hapus',
        content: `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <i data-lucide="trash-2" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-slate-600">Hapus catatan penyaluran untuk <span class="font-black text-slate-800">${receiverName}</span>?</p>
                    <p class="text-xs text-slate-400 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
            </div>
        `,
        saveLabel: 'Ya, Hapus',
        saveClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
        onSave: async () => {
            try {
                await apiPost('deleteTrxKeluar', { id });
                showToast('Catatan penyaluran dihapus');
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

// 5. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div class="space-y-6 pb-10">
            <div id="trx-out-header"></div>

            <!-- Filter Bar -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                    <input type="text" id="search-trx-out" placeholder="Cari penerima atau ID transaksi..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm">
                </div>
                <div class="flex flex-wrap gap-2">
                    <select id="filter-fund-out" class="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 outline-none">
                        <option value="">Semua Dana</option>
                        <option value="Zakat">Zakat</option>
                        <option value="Infaq">Infaq</option>
                        <option value="Wakaf">Wakaf</option>
                    </select>
                    <select id="filter-status-out" class="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 outline-none">
                        <option value="">Semua Status</option>
                        <option value="Berhasil">Berhasil</option>
                        <option value="Proses">Proses</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                </div>
            </div>

            <!-- Table Container -->
            <div id="trx-out-table-container" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]"></div>
        </div>
    `;

    renderHeader();
    attachEvents();
}

function renderHeader() {
    const headerContainer = document.getElementById('trx-out-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = renderPageHeader({
        title: 'Transaksi Keluar',
        subtitle: 'Pencatatan penyaluran dana ZISWAF kepada Mustahik.',
        actions: [
            {
                id: 'btn-add-trx-out',
                label: 'Input Penyaluran',
                icon: 'send'
            }
        ]
    });

    const addBtn = document.getElementById('btn-add-trx-out');
    if (addBtn) {
        addBtn.onclick = () => openFormModal();
    }
}

function updateTableView() {
    const container = document.getElementById('trx-out-table-container');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data penyaluran...');
        return;
    }

    const searchTerm = document.getElementById('search-trx-out')?.value.toLowerCase() || '';
    const fundFilter = document.getElementById('filter-fund-out')?.value || '';
    const statusFilter = document.getElementById('filter-status-out')?.value || '';

    const filteredData = transactionsOut.filter(t => {
        const matchesSearch = (t.receiver_name || '').toLowerCase().includes(searchTerm) || (t.transaksi_id || '').toLowerCase().includes(searchTerm);
        const matchesFund = fundFilter === '' || t.fund_type === fundFilter;
        const matchesStatus = statusFilter === '' || t.status === statusFilter;
        return matchesSearch && matchesFund && matchesStatus;
    });

    if (filteredData.length === 0) {
        container.innerHTML = renderEmptyState('Penyaluran tidak ditemukan', 'Coba ubah filter atau cari dengan kata kunci lain.');
        return;
    }

    container.innerHTML = renderTable({
        headers: ['Tanggal', 'Penerima', 'Asnaf / Dana', 'Program', 'Nominal', 'Status', 'Aksi'],
        data: filteredData,
        renderRow: (item) => {
            const mustahik = masterMustahik.find(m => m.mustahik_id === item.mustahik_id);
            const asnaf = mustahik ? mustahik.asnaf : '-';

            return `
            <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-4 py-4 text-sm text-slate-500">${formatDate(item.tanggal)}</td>
                <td class="px-4 py-4">
                    <div class="font-bold text-slate-800">${item.receiver_name}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${item.transaksi_id}</div>
                </td>
                <td class="px-4 py-4">
                    <div class="text-xs font-bold text-emerald-600">${asnaf}</div>
                    <div class="text-[10px] text-slate-400 uppercase tracking-tighter">${item.fund_type}</div>
                </td>
                <td class="px-4 py-4 text-sm text-slate-600">${item.nama_program}</td>
                <td class="px-4 py-4 text-sm font-black text-slate-800">${formatIDR(item.nominal)}</td>
                <td class="px-4 py-4">${renderBadge(item.status)}</td>
                <td class="px-4 py-4">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.handleTrxOutAction('doc', '${item.transaksi_id}')" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors" title="Dokumentasi"><i data-lucide="image" class="w-4 h-4"></i></button>
                        <button onclick="window.handleTrxOutAction('print', '${item.transaksi_id}')" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors" title="Cetak Bukti"><i data-lucide="printer" class="w-4 h-4"></i></button>
                        <button onclick="window.handleTrxOutAction('edit', '${item.transaksi_id}')" class="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button onclick="window.handleTrxOutAction('delete', '${item.transaksi_id}')" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `;
        }
    });

    if (window.lucide) window.lucide.createIcons();
}

function attachEvents() {
    document.getElementById('search-trx-out')?.addEventListener('input', updateTableView);
    document.getElementById('filter-fund-out')?.addEventListener('change', updateTableView);
    document.getElementById('filter-status-out')?.addEventListener('change', updateTableView);

    window.handleTrxOutAction = (action, id) => {
        const trx = transactionsOut.find(t => t.transaksi_id === id);
        if (!trx) return;

        switch(action) {
            case 'edit': openFormModal(trx); break;
            case 'doc': showDocumentation(trx); break;
            case 'print': handlePrint(trx); break;
            case 'delete': handleDelete(id, trx.receiver_name); break;
        }
    };
}

function openFormModal(trx = null) {
    const isEdit = !!trx;
    const fundTypes = getCachedData('balance') || [];
    
    showModal({
        title: isEdit ? 'Edit Penyaluran Dana' : 'Input Penyaluran Dana',
        content: `
            <form id="form-trx-out" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Tanggal Penyaluran *</label>
                    <input type="date" id="to-date" value="${trx?.tanggal || new Date().toISOString().split('T')[0]}" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Mustahik (Penerima) *</label>
                    <select id="to-mustahik" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="">Pilih Mustahik</option>
                        ${masterMustahik.map(m => `<option value="${m.mustahik_id}" ${trx?.mustahik_id === m.mustahik_id ? 'selected' : ''}>${m.nama_lengkap} (${m.asnaf})</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Jenis Dana *</label>
                    <select id="to-fund" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="">Pilih Jenis</option>
                        ${fundTypes.map(f => `<option value="${f.fund}" ${trx?.fund_type === f.fund ? 'selected' : ''}>${f.fund}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Program Terkait</label>
                    <select id="to-program" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="">Pilih Program</option>
                        <!-- Akan diisi secara dinamis -->
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Nominal Penyaluran (Rp) *</label>
                    <input type="number" id="to-amount" value="${trx?.nominal || ''}" required min="1" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-red-600">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Bentuk Bantuan</label>
                    <select id="to-form" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Uang Tunai" ${trx?.form === 'Uang Tunai' ? 'selected' : ''}>Uang Tunai</option>
                        <option value="Sembako" ${trx?.form === 'Sembako' ? 'selected' : ''}>Sembako</option>
                        <option value="Beasiswa" ${trx?.form === 'Beasiswa' ? 'selected' : ''}>Beasiswa</option>
                        <option value="Modal Usaha" ${trx?.form === 'Modal Usaha' ? 'selected' : ''}>Modal Usaha</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Status Penyaluran</label>
                    <select id="to-status" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Proses" ${trx?.status === 'Proses' ? 'selected' : ''}>Proses</option>
                        <option value="Berhasil" ${trx?.status === 'Berhasil' ? 'selected' : ''}>Berhasil</option>
                        <option value="Dibatalkan" ${trx?.status === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">URL Dokumentasi (Foto)</label>
                    <input type="url" id="to-doc" value="${trx?.docUrl || ''}" placeholder="https://..." class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Keterangan Tambahan</label>
                    <textarea id="to-note" rows="2" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none">${trx?.note || ''}</textarea>
                </div>
            </form>
        `,
        onSave: () => {
            const mustahikId = document.getElementById('to-mustahik').value;
            const fundType = document.getElementById('to-fund').value;
            const amount = parseInt(document.getElementById('to-amount').value);

            // 1. Validasi Dasar
            if (!mustahikId || !fundType || !amount || amount <= 0) {
                showToast('Lengkapi data dengan benar!', 'error');
                return false;
            }

            const mustahik = masterMustahik.find(m => m.mustahik_id === mustahikId);
            
            const programId = document.getElementById('to-program').value;
            const program = masterPrograms.find(p => p.program_id === programId);
            
            // 2. Aturan Bisnis: Cek Saldo
            const currentBalance = availableBalance[fundType] || 0;
            if (amount > currentBalance) {
                showToast(`Saldo ${fundType} tidak mencukupi! (Sisa: ${formatIDR(currentBalance)})`, 'error');
                return false;
            }

            // 2b. Aturan Bisnis: Cek Saldo Program (Jika ada program)
            if (program && amount > (program.balance || 0)) {
                showToast(`Saldo Program ${program.nama_program} tidak mencukupi! (Sisa: ${formatIDR(program.balance || 0)})`, 'error');
                return false;
            }

            // 3. Aturan Bisnis: Zakat harus untuk Asnaf
            if (fundType === 'Zakat' && !['Fakir', 'Miskin', 'Gharimin', 'Mualaf', 'Fisabilillah'].includes(mustahik.asnaf)) {
                showToast('Dana Zakat hanya boleh disalurkan kepada 8 Asnaf!', 'error');
                return false;
            }

            const data = {
                transaksi_id: trx?.transaksi_id,
                tanggal: document.getElementById('to-date').value,
                mustahik_id: mustahikId,
                receiver_name: mustahik.nama_lengkap,
                fund_type: fundType,
                program_id: program?.program_id || '-',
                nama_program: program?.nama_program || 'Umum',
                nominal: amount,
                metode: document.getElementById('to-form').value,
                status: document.getElementById('to-status').value,
                keterangan: document.getElementById('to-note').value
            };

            return handleSave(data, isEdit);
        }
    });

    // Handle Dynamic Program Loading
    const fundSelect = document.getElementById('to-fund');
    const programSelect = document.getElementById('to-program');

    const updatePrograms = (fundType) => {
        const normalize = (f) => {
            if (!f) return '';
            let nf = String(f).trim().toLowerCase();
            if (nf === 'sadaqah' || nf === 'shadaqah' || nf === 'sedekah') return 'shadaqah';
            return nf;
        };
        const target = normalize(fundType);
        const filtered = masterPrograms.filter(p => normalize(p.jenis_dana) === target || normalize(p.fundType) === target);
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

function showDocumentation(trx) {
    if (!trx.doc_url) {
        showToast('Belum ada dokumentasi foto', 'error');
        return;
    }
    showModal({
        title: `Dokumentasi: ${trx.receiver_name}`,
        content: `
            <div class="space-y-4">
                <img src="${trx.doc_url}" alt="Dokumentasi" class="w-full rounded-2xl shadow-lg border border-slate-100" referrerPolicy="no-referrer">
                <div class="p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
                    <p class="font-bold mb-1">Keterangan:</p>
                    <p>${trx.keterangan || 'Tidak ada catatan tambahan.'}</p>
                </div>
            </div>
        `,
        onSave: () => true
    });
}

function handlePrint(trx) {
    const mustahik = masterMustahik.find(m => m.mustahik_id === trx.mustahik_id);
    const asnaf = mustahik ? mustahik.asnaf : '-';

    showModal({
        title: 'Bukti Penyaluran Dana',
        content: `
            <div class="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-6 font-mono text-sm">
                <div class="text-center border-b border-slate-100 pb-4">
                    <h2 class="text-xl font-black text-red-600">BUKTI PENYALURAN</h2>
                    <p class="text-[10px] text-slate-400">No: ${trx.transaksi_id}</p>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between"><span>Tanggal</span><span>${formatDate(trx.tanggal)}</span></div>
                    <div class="flex justify-between"><span>Penerima</span><span class="font-bold">${trx.receiver_name}</span></div>
                    <div class="flex justify-between"><span>Asnaf</span><span>${asnaf}</span></div>
                    <div class="flex justify-between"><span>Sumber Dana</span><span>${trx.fund_type}</span></div>
                    <div class="flex justify-between"><span>Bentuk</span><span>${trx.metode}</span></div>
                </div>
                <div class="py-4 border-y border-slate-100 text-center">
                    <p class="text-[10px] text-slate-400 mb-1">Nominal Bantuan</p>
                    <p class="text-2xl font-black text-slate-800">${formatIDR(trx.nominal)}</p>
                </div>
                <div class="grid grid-cols-2 gap-8 pt-8 text-center">
                    <div>
                        <p class="text-[10px] mb-12">Penerima,</p>
                        <p class="font-bold border-t border-slate-800 pt-1">${trx.receiver_name}</p>
                    </div>
                    <div>
                        <p class="text-[10px] mb-12">Petugas,</p>
                        <p class="font-bold border-t border-slate-800 pt-1">Admin</p>
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

