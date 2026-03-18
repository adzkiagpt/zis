import { renderBadge, renderTable, renderPageHeader, renderEmptyState, renderLoadingState, showModal, showToast } from '../ui.js';
import { apiGet, apiPost } from '../api.js';
import { getCachedData, updateCache } from '../dataStore.js';
import { formatIDR } from '../utils.js';

// 1. State & Data
let donaturData = [];
let isLoading = false;

// 2. Initialization
export function initDonatur(container) {
    renderLayout(container);
    fetchData();
}

// 3. Data Logic
async function fetchData(force = false) {
    isLoading = true;
    updateTableView();
    updateHeader();
    
    try {
        if (!force) {
            const cached = getCachedData('donatur');
            if (cached) {
                donaturData = cached;
                isLoading = false;
                updateTableView();
                updateHeader();
                return;
            }
        }

        const result = await apiGet('getDonatur');
        donaturData = Array.isArray(result) ? result : [];
        updateCache('donatur', donaturData);
    } catch (error) {
        showToast('Gagal mengambil data: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateTableView();
        updateHeader();
    }
}

async function handleSave(item, isEdit) {
    const nama_lengkap = document.getElementById('d-nama').value;
    const kategori = document.getElementById('d-kat').value;
    const no_hp = document.getElementById('d-hp').value;
    const email = document.getElementById('d-email').value;

    if (!nama_lengkap) {
        showToast('Nama lengkap wajib diisi', 'error');
        return false;
    }

    // Duplicate Check
    const isDuplicate = donaturData.some(d => {
        // Skip self if editing
        if (isEdit && d.donatur_id === item.donatur_id) return false;
        
        const sameEmail = email && d.email && d.email.toLowerCase() === email.toLowerCase();
        const samePhone = no_hp && d.no_hp && d.no_hp === no_hp;
        
        return sameEmail || samePhone;
    });

    if (isDuplicate) {
        showToast('Donatur dengan Email atau Nomor Telepon ini sudah terdaftar!', 'error');
        return false;
    }

    const data = {
        donatur_id: item?.donatur_id,
        nama_lengkap,
        kategori,
        no_hp,
        email,
        status: 'Aktif'
    };

    try {
        const action = isEdit ? 'updateDonatur' : 'addDonatur';
        await apiPost(action, data);
        showToast(isEdit ? 'Data diperbarui' : 'Donatur ditambahkan');
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
                    <p class="text-slate-600">Apakah Anda yakin ingin menghapus donatur <span class="font-black text-slate-800">${name}</span>?</p>
                    <p class="text-xs text-slate-400 mt-2">Tindakan ini tidak dapat dibatalkan dan seluruh riwayat donasi terkait akan terpengaruh.</p>
                </div>
            </div>
        `,
        saveLabel: 'Ya, Hapus',
        saveClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
        onSave: async () => {
            try {
                await apiPost('deleteDonatur', { id });
                showToast('Donatur berhasil dihapus');
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

// 4. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div class="space-y-6 pb-10">
            <div id="donatur-header"></div>
            <div id="donatur-table-container" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[200px] flex flex-col"></div>
        </div>
    `;

    updateHeader();
}

function updateHeader() {
    const headerContainer = document.getElementById('donatur-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = renderPageHeader({
        title: 'Data Donatur',
        subtitle: 'Kelola informasi profil dan riwayat donatur.',
        actions: [
            { 
                id: 'btn-refresh-donatur', 
                label: '', 
                icon: isLoading ? 'loader-2' : 'refresh-cw',
                className: `p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center min-w-[44px] ${isLoading ? 'animate-spin cursor-not-allowed opacity-50' : ''}`
            },
            { 
                id: 'btn-add-donatur', 
                label: 'Tambah Donatur', 
                icon: 'plus',
                onClick: () => openFormModal()
            }
        ]
    });

    const refreshBtn = document.getElementById('btn-refresh-donatur');
    if (refreshBtn && !isLoading) {
        refreshBtn.onclick = () => fetchData(true);
    }

    const addBtn = document.getElementById('btn-add-donatur');
    if (addBtn) {
        addBtn.onclick = () => openFormModal();
    }
}

function updateTableView() {
    const container = document.getElementById('donatur-table-container');
    if (!container) return;
    
    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data donatur...');
        return;
    }

    if (donaturData.length === 0) {
        container.innerHTML = renderEmptyState('Belum ada data donatur', 'Klik tombol "Tambah Donatur" untuk memulai.');
        return;
    }

    container.innerHTML = renderTable({
        headers: ['ID Donatur', 'Nama Lengkap', 'Kategori', 'Kontak', 'Total Donasi', 'Status', 'Aksi'],
        data: donaturData,
        renderRow: (item) => `
            <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-4 font-mono text-xs text-slate-500">${item.donatur_id}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">${item.nama_lengkap}</div>
                    <div class="text-[10px] text-slate-400 font-medium">${item.email || '-'}</div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">${item.kategori}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${item.no_hp}</td>
                <td class="px-6 py-4 text-sm font-black text-slate-800">${formatIDR(item.total_donasi || 0)}</td>
                <td class="px-6 py-4">${renderBadge(item.status)}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.handleDonaturAction('edit', '${item.donatur_id}')" class="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button onclick="window.handleDonaturAction('delete', '${item.donatur_id}')" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `
    });

    window.handleDonaturAction = (action, id) => {
        const item = donaturData.find(d => d.donatur_id === id);
        if (action === 'edit') openFormModal(item);
        if (action === 'delete') handleDelete(id, item?.nama_lengkap || 'Donatur');
    };

    if (window.lucide) window.lucide.createIcons();
}

function openFormModal(item = null) {
    const isEdit = !!item;
    showModal({
        title: isEdit ? 'Edit Donatur' : 'Tambah Donatur',
        content: `
            <form id="form-donatur" class="space-y-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap *</label>
                    <input type="text" id="d-nama" value="${item?.nama_lengkap || ''}" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/20">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                    <input type="email" id="d-email" value="${item?.email || ''}" placeholder="contoh@email.com" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/20">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                        <select id="d-kat" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm">
                            <option value="Individu" ${item?.kategori === 'Individu' ? 'selected' : ''}>Individu</option>
                            <option value="Lembaga" ${item?.kategori === 'Lembaga' ? 'selected' : ''}>Lembaga</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">No. WhatsApp</label>
                        <input type="text" id="d-hp" value="${item?.no_hp || ''}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/20">
                    </div>
                </div>
            </form>
        `,
        onSave: () => handleSave(item, isEdit)
    });
}
