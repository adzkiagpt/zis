import { renderBadge, renderTable, renderPageHeader, renderEmptyState, renderLoadingState, showModal, showToast } from '../ui.js';
import { apiGet, apiPost } from '../api.js';
import { getCachedData, updateCache } from '../dataStore.js';

// 1. State & Data
let mustahikList = [];
let isLoading = false;

// 2. Initialization
export function initMustahik(container) {
    renderLayout(container);
    fetchData();
}

// 3. Data Logic
async function fetchData(force = false) {
    isLoading = true;
    updateTableView();
    
    try {
        if (!force) {
            const cached = getCachedData('mustahik');
            if (cached) {
                mustahikList = cached;
                isLoading = false;
                updateTableView();
                return;
            }
        }

        const result = await apiGet('getMustahik');
        mustahikList = Array.isArray(result) ? result : [];
        updateCache('mustahik', mustahikList);
    } catch (error) {
        showToast('Gagal mengambil data: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateTableView();
    }
}

async function handleSave(mustahik, isEdit) {
    const name = document.getElementById('m-name').value;
    const nik = document.getElementById('m-nik').value;

    if (!name || !nik) {
        showToast('Nama dan NIK wajib diisi!', 'error');
        return false;
    }

    const data = {
        mustahik_id: mustahik?.mustahik_id,
        nama_lengkap: name,
        nik: nik,
        no_hp: document.getElementById('m-phone').value,
        wilayah: document.getElementById('m-region').value,
        asnaf: document.getElementById('m-asnaf').value,
        program_utama: document.getElementById('m-program').value,
        status: document.getElementById('m-status').value,
        alamat: document.getElementById('m-address').value,
        keterangan: document.getElementById('m-note').value
    };

    try {
        const action = isEdit ? 'updateMustahik' : 'addMustahik';
        await apiPost(action, data);
        showToast(isEdit ? 'Data diperbarui' : 'Mustahik ditambahkan');
        fetchData();
        return true;
    } catch (error) {
        showToast('Gagal menyimpan: ' + error.message, 'error');
        return false;
    }
}

async function handleDelete(id, name) {
    showModal({
        title: 'Konfirmasi Hapus',
        content: `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <i data-lucide="trash-2" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-slate-600">Apakah Anda yakin ingin menghapus data mustahik <span class="font-black text-slate-800">${name}</span>?</p>
                    <p class="text-xs text-slate-400 mt-2">Tindakan ini akan menghapus seluruh profil dan riwayat bantuan terkait.</p>
                </div>
            </div>
        `,
        saveLabel: 'Ya, Hapus',
        saveClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
        onSave: async () => {
            try {
                await apiPost('deleteMustahik', { id });
                showToast('Data mustahik berhasil dihapus');
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

async function handleVerify(mustahik) {
    showModal({
        title: 'Verifikasi Mustahik',
        content: `
            <div class="space-y-4">
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Mustahik</p>
                    <p class="font-bold text-slate-800">${mustahik.nama_lengkap}</p>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Ubah Status Menjadi</label>
                    <select id="v-status" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Terverifikasi">Terverifikasi (Layak Bantu)</option>
                        <option value="Proses">Sedang Diproses</option>
                        <option value="Ditolak">Ditolak (Tidak Layak)</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Catatan Verifikasi</label>
                    <textarea id="v-note" rows="3" placeholder="Alasan verifikasi..." class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none"></textarea>
                </div>
            </div>
        `,
        onSave: async () => {
            const newStatus = document.getElementById('v-status').value;
            const note = document.getElementById('v-note').value;
            
            try {
                await apiPost('updateMustahikStatus', { 
                    id: mustahik.mustahik_id, 
                    status: newStatus, 
                    note: note || mustahik.keterangan 
                });
                showToast(`Status mustahik diubah menjadi ${newStatus}`);
                fetchData();
                return true;
            } catch (error) {
                showToast('Gagal verifikasi: ' + error.message, 'error');
                return false;
            }
        }
    });
}

// 4. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div class="space-y-6 pb-10">
            <div id="mustahik-header"></div>
            
            <!-- Filter & Search -->
            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4"></i>
                    <input type="text" id="search-mustahik" placeholder="Cari nama, NIK, atau wilayah..." class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm font-medium">
                </div>
                <div class="flex flex-wrap gap-2">
                    <select id="filter-asnaf" class="px-4 py-3 bg-slate-50 border border-slate-50 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">Semua Asnaf</option>
                        <option value="Fakir">Fakir</option>
                        <option value="Miskin">Miskin</option>
                        <option value="Gharimin">Gharimin</option>
                        <option value="Mualaf">Mualaf</option>
                        <option value="Fisabilillah">Fisabilillah</option>
                    </select>
                    <select id="filter-status" class="px-4 py-3 bg-slate-50 border border-slate-50 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">Semua Status</option>
                        <option value="Terverifikasi">Terverifikasi</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Proses">Proses</option>
                    </select>
                </div>
            </div>

            <div id="mustahik-table-container" class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[200px] flex flex-col"></div>
        </div>
    `;

    renderHeader();
    attachEvents();
}

function renderHeader() {
    const headerContainer = document.getElementById('mustahik-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = renderPageHeader({
        title: 'Manajemen Mustahik',
        subtitle: 'Kelola data penerima manfaat dan alur verifikasi bantuan.',
        actions: [
            {
                id: 'btn-add-mustahik',
                label: 'Tambah Mustahik',
                icon: 'plus'
            }
        ]
    });

    const addBtn = document.getElementById('btn-add-mustahik');
    if (addBtn) {
        addBtn.onclick = () => openFormModal();
    }
}

function updateTableView() {
    const container = document.getElementById('mustahik-table-container');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data mustahik...');
        return;
    }

    const searchTerm = document.getElementById('search-mustahik')?.value.toLowerCase() || '';
    const asnafFilter = document.getElementById('filter-asnaf')?.value || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';

    const filteredData = mustahikList.filter(m => {
        const matchesSearch = (m.nama_lengkap || '').toLowerCase().includes(searchTerm) || 
                             (m.nik || '').includes(searchTerm) || 
                             (m.wilayah || '').toLowerCase().includes(searchTerm);
        const matchesAsnaf = asnafFilter === '' || m.asnaf === asnafFilter;
        const matchesStatus = statusFilter === '' || m.status === statusFilter;
        return matchesSearch && matchesAsnaf && matchesStatus;
    });

    if (filteredData.length === 0) {
        container.innerHTML = renderEmptyState('Tidak ada data mustahik', 'Coba ubah filter atau cari dengan kata kunci lain.');
        return;
    }

    container.innerHTML = renderTable({
        headers: ['ID', 'Nama Mustahik', 'Wilayah', 'Asnaf', 'Program Utama', 'Status', 'Aksi'],
        data: filteredData,
        renderRow: (item) => `
            <tr class="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                <td class="px-6 py-4 text-xs font-mono text-slate-400">${item.mustahik_id}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">${item.nama_lengkap}</div>
                    <div class="text-[10px] text-slate-400 font-mono tracking-tighter">${item.nik || '-'}</div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.wilayah || '-'}</td>
                <td class="px-6 py-4 text-sm font-black text-emerald-600">${item.asnaf}</td>
                <td class="px-6 py-4 text-sm text-slate-600 font-medium">${item.program_utama || '-'}</td>
                <td class="px-6 py-4">${renderBadge(item.status)}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.handleMustahikAction('verify', '${item.mustahik_id}')" class="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Verifikasi"><i data-lucide="shield-check" class="w-4 h-4"></i></button>
                        <button onclick="window.handleMustahikAction('edit', '${item.mustahik_id}')" class="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button onclick="window.handleMustahikAction('delete', '${item.mustahik_id}')" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `
    });

    if (window.lucide) window.lucide.createIcons();
}

function attachEvents() {
    document.getElementById('search-mustahik')?.addEventListener('input', updateTableView);
    document.getElementById('filter-asnaf')?.addEventListener('change', updateTableView);
    document.getElementById('filter-status')?.addEventListener('change', updateTableView);

    window.handleMustahikAction = (action, id) => {
        const mustahik = mustahikList.find(m => m.mustahik_id === id);
        if (!mustahik) return;

        switch(action) {
            case 'edit': openFormModal(mustahik); break;
            case 'verify': handleVerify(mustahik); break;
            case 'delete': handleDelete(id, mustahik.nama_lengkap); break;
        }
    };
}

function openFormModal(mustahik = null) {
    const isEdit = !!mustahik;
    showModal({
        title: isEdit ? 'Edit Data Mustahik' : 'Tambah Mustahik Baru',
        content: `
            <form id="form-mustahik" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap *</label>
                    <input type="text" id="m-name" value="${mustahik?.nama_lengkap || ''}" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">NIK *</label>
                    <input type="text" id="m-nik" value="${mustahik?.nik || ''}" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">No. HP</label>
                    <input type="tel" id="m-phone" value="${mustahik?.no_hp || ''}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Wilayah</label>
                    <input type="text" id="m-region" value="${mustahik?.wilayah || ''}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Kategori Asnaf</label>
                    <select id="m-asnaf" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Fakir" ${mustahik?.asnaf === 'Fakir' ? 'selected' : ''}>Fakir</option>
                        <option value="Miskin" ${mustahik?.asnaf === 'Miskin' ? 'selected' : ''}>Miskin</option>
                        <option value="Gharimin" ${mustahik?.asnaf === 'Gharimin' ? 'selected' : ''}>Gharimin</option>
                        <option value="Mualaf" ${mustahik?.asnaf === 'Mualaf' ? 'selected' : ''}>Mualaf</option>
                        <option value="Fisabilillah" ${mustahik?.asnaf === 'Fisabilillah' ? 'selected' : ''}>Fisabilillah</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Program Utama</label>
                    <input type="text" id="m-program" value="${mustahik?.program_utama || ''}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Status Verifikasi</label>
                    <select id="m-status" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Menunggu" ${mustahik?.status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
                        <option value="Proses" ${mustahik?.status === 'Proses' ? 'selected' : ''}>Proses</option>
                        <option value="Terverifikasi" ${mustahik?.status === 'Terverifikasi' ? 'selected' : ''}>Terverifikasi</option>
                    </select>
                </div>
                <div class="space-y-1 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                    <textarea id="m-address" rows="2" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none">${mustahik?.alamat || ''}</textarea>
                </div>
                <div class="space-y-1 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Catatan / Kondisi Ekonomi</label>
                    <textarea id="m-note" rows="2" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none">${mustahik?.keterangan || ''}</textarea>
                </div>
            </form>
        `,
        onSave: () => handleSave(mustahik, isEdit)
    });
}

