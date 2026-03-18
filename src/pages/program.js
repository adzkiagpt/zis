import { renderBadge, renderTable, showModal, showToast, renderPageHeader, renderEmptyState, renderLoadingState } from '../ui.js';
import { formatDate, formatIDR } from '../utils.js';
import { apiGet, apiPost } from '../api.js';
import { getCachedData, updateCache } from '../dataStore.js';

// 1. State & Data
let programList = [];
let isLoading = false;

// 2. Initialization
export function initProgram(container) {
    renderLayout(container);
    fetchData();
}

// 3. Data Logic
async function fetchData(force = false) {
    isLoading = true;
    updateTableView();
    
    try {
        if (!force) {
            const cached = getCachedData('program');
            if (cached) {
                programList = cached;
                isLoading = false;
                updateTableView();
                return;
            }
        }

        const result = await apiGet('getProgram');
        programList = Array.isArray(result) ? result : [];
        updateCache('program', programList);
    } catch (error) {
        showToast('Gagal mengambil data: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateTableView();
    }
}

async function handleSave(data, isEdit) {
    try {
        const action = isEdit ? 'updateProgram' : 'addProgram';
        await apiPost(action, data);
        showToast(isEdit ? 'Program diperbarui' : 'Program baru ditambahkan');
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
                    <p class="text-slate-600">Apakah Anda yakin ingin menghapus program <span class="font-black text-slate-800">${name}</span>?</p>
                    <p class="text-xs text-slate-400 mt-2">Tindakan ini akan menghapus data program. Semua data transaksi terkait mungkin akan terpengaruh.</p>
                </div>
            </div>
        `,
        saveLabel: 'Ya, Hapus',
        saveClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
        onSave: async () => {
            try {
                await apiPost('deleteProgram', { id });
                showToast('Program berhasil dihapus');
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
            <div id="program-header"></div>
            
            <!-- Filter & Search -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                    <input type="text" id="search-program" placeholder="Cari nama program atau PIC..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm">
                </div>
                <div class="flex flex-wrap gap-2">
                    <select id="filter-category" class="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">Semua Kategori</option>
                        <option value="Pendidikan">Pendidikan</option>
                        <option value="Kesehatan">Kesehatan</option>
                        <option value="Infrastruktur">Infrastruktur</option>
                        <option value="Ekonomi">Ekonomi</option>
                        <option value="Kemanusiaan">Kemanusiaan</option>
                    </select>
                    <select id="filter-status-prg" class="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">Semua Status</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
            </div>

            <!-- Table Container -->
            <div id="program-table-container" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]"></div>
        </div>
    `;

    renderHeader();
    attachEvents();
}

function renderHeader() {
    const headerContainer = document.getElementById('program-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = renderPageHeader({
        title: 'Program ZISWAF',
        subtitle: 'Kelola kampanye penghimpunan dan target penyaluran dana.',
        actions: [
            {
                id: 'btn-add-program',
                label: 'Buat Program Baru',
                icon: 'plus'
            }
        ]
    });

    const addBtn = document.getElementById('btn-add-program');
    if (addBtn) {
        addBtn.onclick = () => openFormModal();
    }
}

function updateTableView() {
    const container = document.getElementById('program-table-container');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data program...');
        return;
    }

    const searchTerm = document.getElementById('search-program')?.value.toLowerCase() || '';
    const catFilter = document.getElementById('filter-category')?.value || '';
    const statusFilter = document.getElementById('filter-status-prg')?.value || '';

    const filteredData = programList.filter(p => {
        const name = p.nama_program || p.name || '';
        const pic = p.pic || '';
        const category = p.kategori || p.category || '';
        const status = p.status || '';

        const matchesSearch = (name || '').toLowerCase().includes(searchTerm) || (pic || '').toLowerCase().includes(searchTerm);
        const matchesCat = catFilter === '' || category === catFilter;
        const matchesStatus = statusFilter === '' || status === statusFilter;
        return matchesSearch && matchesCat && matchesStatus;
    });

    if (filteredData.length === 0) {
        container.innerHTML = renderEmptyState('Program tidak ditemukan', 'Coba ubah filter atau cari dengan kata kunci lain.');
        return;
    }

    container.innerHTML = renderTable({
        headers: ['ID', 'Nama Program', 'Kategori', 'Default Dana', 'Target Dana', 'Status', 'Aksi'],
        data: filteredData,
        renderRow: (item) => {
            const id = item.program_id || item.id;
            const name = item.nama_program || item.name;
            const category = item.kategori || item.category;
            const fundType = item.jenis_dana || item.fundType;
            const target = item.target_dana || item.target;
            const status = item.status;
            const pic = item.pic || '-';

            return `
            <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-4 py-4 text-xs font-mono text-slate-400">${id}</td>
                <td class="px-4 py-4">
                    <div class="font-bold text-slate-800">${name}</div>
                    <div class="text-[10px] text-slate-400 uppercase tracking-tighter">PIC: ${pic}</div>
                </td>
                <td class="px-4 py-4 text-sm text-slate-600">${category}</td>
                <td class="px-4 py-4 text-sm font-medium text-emerald-600">${fundType}</td>
                <td class="px-4 py-4 text-sm font-bold text-slate-700">${formatIDR(target)}</td>
                <td class="px-4 py-4">${renderBadge(status)}</td>
                <td class="px-4 py-4">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.handleProgramAction('progress', '${id}')" class="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Lihat Progres"><i data-lucide="trending-up" class="w-4 h-4"></i></button>
                        <button onclick="window.handleProgramAction('edit', '${id}')" class="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button onclick="window.handleProgramAction('transactions', '${id}')" class="p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-600 transition-colors" title="Transaksi"><i data-lucide="list-ordered" class="w-4 h-4"></i></button>
                        <button onclick="window.handleProgramAction('delete', '${id}')" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `;
        }
    });

    if (window.lucide) window.lucide.createIcons();
}

function attachEvents() {
    document.getElementById('search-program')?.addEventListener('input', updateTableView);
    document.getElementById('filter-category')?.addEventListener('change', updateTableView);
    document.getElementById('filter-status-prg')?.addEventListener('change', updateTableView);

    window.handleProgramAction = (action, id) => {
        const program = programList.find(p => (p.program_id || p.id) === id);
        if (!program) return;

        switch(action) {
            case 'edit': openFormModal(program); break;
            case 'progress': showProgress(program); break;
            case 'transactions': showTransactions(program); break;
            case 'delete': handleDelete(id, program.nama_program || program.name); break;
        }
    };
}

function openFormModal(program = null) {
    const isEdit = !!program;
    const name = program?.nama_program || program?.name || '';
    const category = program?.kategori || program?.category || 'Pendidikan';
    const fundType = program?.jenis_dana || program?.fundType || 'Zakat';
    const target = program?.target_dana || program?.target || '';
    const pic = program?.pic || '';
    const start = program?.tgl_mulai || program?.start || '';
    const end = program?.tgl_selesai || program?.end || '';
    const desc = program?.deskripsi || program?.desc || '';

    showModal({
        title: isEdit ? 'Edit Program' : 'Buat Program Baru',
        content: `
            <form id="form-program" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Nama Program *</label>
                    <input type="text" id="p-name" value="${name}" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                    <select id="p-category" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        <option value="Pendidikan" ${category === 'Pendidikan' ? 'selected' : ''}>Pendidikan</option>
                        <option value="Kesehatan" ${category === 'Kesehatan' ? 'selected' : ''}>Kesehatan</option>
                        <option value="Infrastruktur" ${category === 'Infrastruktur' ? 'selected' : ''}>Infrastruktur</option>
                        <option value="Ekonomi" ${category === 'Ekonomi' ? 'selected' : ''}>Ekonomi</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Jenis Dana Default</label>
                    <select id="p-fund" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                        ${(getCachedData('balance') || []).map(f => `<option value="${f.fund}" ${fundType === f.fund ? 'selected' : ''}>${f.fund}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Target Dana (Rp) *</label>
                    <input type="number" id="p-target" value="${target}" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">PIC Program</label>
                    <input type="text" id="p-pic" value="${pic}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Tanggal Mulai</label>
                    <input type="date" id="p-start" value="${start}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Tanggal Selesai</label>
                    <input type="date" id="p-end" value="${end}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm">
                </div>
                <div class="space-y-1 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Program</label>
                    <textarea id="p-desc" rows="3" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none">${desc}</textarea>
                </div>
            </form>
        `,
        onSave: () => {
            const nameVal = document.getElementById('p-name').value.trim();
            const targetRaw = document.getElementById('p-target').value;
            // Clean non-numeric characters except for decimal point if needed
            const targetVal = targetRaw.replace(/[^0-9]/g, '');

            if (!nameVal || !targetVal) {
                showToast('Nama dan Target Dana wajib diisi!', 'error');
                return false;
            }

            const data = {
                program_id: program?.program_id || program?.id,
                nama_program: nameVal,
                kategori: document.getElementById('p-category').value,
                jenis_dana: document.getElementById('p-fund').value,
                target_dana: parseInt(targetVal) || 0,
                pic: document.getElementById('p-pic').value.trim(),
                tgl_mulai: document.getElementById('p-start').value,
                tgl_selesai: document.getElementById('p-end').value,
                deskripsi: document.getElementById('p-desc').value.trim(),
                status: isEdit ? program.status : 'Aktif'
            };

            return handleSave(data, isEdit);
        }
    });
}

function showProgress(program) {
    const target = program.target_dana || program.target || 1;
    const collected = program.collected || 0;
    const percent = Math.round((collected / target) * 100);
    const name = program.nama_program || program.name;
    const desc = program.deskripsi || program.desc || '-';

    showModal({
        title: `Progres: ${name}`,
        content: `
            <div class="space-y-8">
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p class="text-[10px] font-bold text-emerald-600 uppercase mb-1">Terhimpun</p>
                        <p class="text-xl font-black text-emerald-700">${formatIDR(collected)}</p>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Target</p>
                        <p class="text-xl font-black text-slate-800">${formatIDR(target)}</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-end">
                        <p class="text-sm font-bold text-slate-600">Pencapaian Target</p>
                        <p class="text-2xl font-black text-emerald-600">${percent}%</p>
                    </div>
                    <div class="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div class="h-full bg-emerald-500 shadow-inner transition-all duration-1000" style="width: ${percent}%"></div>
                    </div>
                </div>

                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm text-slate-500 italic">
                    "${desc}"
                </div>
            </div>
        `,
        onSave: () => true
    });
}

function showTransactions(program) {
    const name = program.nama_program || program.name;
    showModal({
        title: `Transaksi: ${name}`,
        content: `
            <div class="space-y-4">
                <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                    <span>Donatur / Tanggal</span>
                    <span>Nominal</span>
                </div>
                <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <div class="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                        <div><p class="text-sm font-bold text-slate-800">Hamba Allah</p><p class="text-[10px] text-slate-400">17 Mar 2026</p></div>
                        <span class="font-bold text-emerald-600">Rp 5.000.000</span>
                    </div>
                    <div class="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                        <div><p class="text-sm font-bold text-slate-800">Budi Santoso</p><p class="text-[10px] text-slate-400">16 Mar 2026</p></div>
                        <span class="font-bold text-emerald-600">Rp 250.000</span>
                    </div>
                </div>
                <button class="w-full py-3 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">Lihat Laporan Lengkap</button>
            </div>
        `,
        onSave: () => true
    });
}

