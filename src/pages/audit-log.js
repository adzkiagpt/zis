import { renderTable, showToast, renderPageHeader, renderLoadingState } from '../ui.js';
import { apiGet } from '../api.js';

// 1. State
let auditLogs = [];
let isLoading = false;
let searchTerm = '';
let userFilter = '';
let moduleFilter = '';
let dateFilter = '';

// 2. Initialization
export async function initAuditLog(container) {
    renderLayout(container);
    fetchData();
}

// 3. Data Logic
async function fetchData() {
    isLoading = true;
    updateTableView();
    
    try {
        const result = await apiGet('getAuditLogs');
        auditLogs = Array.isArray(result) ? result : [];
    } catch (error) {
        showToast('Gagal mengambil data: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateTableView();
    }
}

// 4. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div id="audit-log-content" class="space-y-6 pb-10">
            ${renderLoadingState('Menyiapkan audit log...')}
        </div>
    `;
}

function updateTableView() {
    const container = document.getElementById('audit-log-content');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data audit log...');
        return;
    }

    container.innerHTML = `
        ${renderPageHeader({
            title: 'Audit Log',
            subtitle: 'Rekam jejak aktivitas pengguna di dalam sistem.',
            actions: [
                { id: 'btn-export-log', label: 'Export Log', icon: 'download' }
            ]
        })}

        <!-- Filter Bar -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
            <div class="relative flex-1">
                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                <input type="text" id="search-log" value="${searchTerm}" placeholder="Cari aksi, detail, atau ID data..." class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium">
            </div>
            <div class="flex flex-wrap gap-2">
                <input type="date" id="filter-date-log" value="${dateFilter}" class="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none">
                <select id="filter-user-log" class="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none">
                    <option value="">Semua User</option>
                    <option value="Super Admin" ${userFilter === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                    <option value="Siti Aminah" ${userFilter === 'Siti Aminah' ? 'selected' : ''}>Siti Aminah</option>
                    <option value="Budi Raharjo" ${userFilter === 'Budi Raharjo' ? 'selected' : ''}>Budi Raharjo</option>
                </select>
                <select id="filter-module-log" class="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none">
                    <option value="">Semua Modul</option>
                    <option value="Auth" ${moduleFilter === 'Auth' ? 'selected' : ''}>Auth</option>
                    <option value="Donatur" ${moduleFilter === 'Donatur' ? 'selected' : ''}>Donatur</option>
                    <option value="Mustahik" ${moduleFilter === 'Mustahik' ? 'selected' : ''}>Mustahik</option>
                    <option value="Program" ${moduleFilter === 'Program' ? 'selected' : ''}>Program</option>
                    <option value="Transaksi Masuk" ${moduleFilter === 'Transaksi Masuk' ? 'selected' : ''}>Transaksi Masuk</option>
                    <option value="Transaksi Keluar" ${moduleFilter === 'Transaksi Keluar' ? 'selected' : ''}>Transaksi Keluar</option>
                </select>
            </div>
        </div>

        <!-- Table Container -->
        <div id="log-table-container" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            ${renderLogTable()}
        </div>
    `;

    attachEvents();
    if (window.lucide) window.lucide.createIcons();
}

function renderLogTable() {
    const filteredData = auditLogs.filter(log => {
        const matchesSearch = (log.detail || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                             (log.action || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                             (log.dataId || '').toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesUser = userFilter === '' || log.user === userFilter;
        const matchesModule = moduleFilter === '' || log.module === moduleFilter;
        const matchesDate = dateFilter === '' || log.time.startsWith(dateFilter);
        return matchesSearch && matchesUser && matchesModule && matchesDate;
    });

    return renderTable({
        headers: ['Waktu', 'User', 'Aksi', 'Modul', 'Detail', 'IP Address'],
        data: filteredData,
        renderRow: (item) => `
            <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                <td class="px-6 py-4">
                    <div class="text-xs font-bold text-slate-800">${item.time.split(' ')[0]}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5">${item.time.split(' ')[1]}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-black text-slate-700">${item.user}</div>
                    <div class="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">ID: ${item.id}</div>
                </td>
                <td class="px-6 py-4">
                    ${renderActionBadge(item.action)}
                </td>
                <td class="px-6 py-4">
                    <div class="text-xs font-black text-slate-600">${item.module}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5">${item.dataId}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-xs text-slate-600 max-w-xs truncate font-medium" title="${item.detail}">${item.detail}</div>
                </td>
                <td class="px-6 py-4 text-[10px] font-mono text-slate-400 font-bold">
                    ${item.ip}
                </td>
            </tr>
        `
    });
}

function renderActionBadge(action) {
    let color = 'bg-slate-100 text-slate-600 border-slate-200';
    switch(action) {
        case 'CREATE': color = 'bg-emerald-50 text-emerald-700 border-emerald-100'; break;
        case 'UPDATE': color = 'bg-blue-50 text-blue-700 border-blue-100'; break;
        case 'DELETE': color = 'bg-rose-50 text-rose-700 border-rose-100'; break;
        case 'VERIFY': color = 'bg-purple-50 text-purple-700 border-purple-100'; break;
        case 'LOGIN': color = 'bg-amber-50 text-amber-700 border-amber-100'; break;
    }
    return `<span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${color}">${action}</span>`;
}

function attachEvents() {
    const searchInput = document.getElementById('search-log');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchTerm = e.target.value;
            const tableContainer = document.getElementById('log-table-container');
            if (tableContainer) tableContainer.innerHTML = renderLogTable();
        };
    }

    const userSelect = document.getElementById('filter-user-log');
    if (userSelect) {
        userSelect.onchange = (e) => {
            userFilter = e.target.value;
            const tableContainer = document.getElementById('log-table-container');
            if (tableContainer) tableContainer.innerHTML = renderLogTable();
        };
    }

    const moduleSelect = document.getElementById('filter-module-log');
    if (moduleSelect) {
        moduleSelect.onchange = (e) => {
            moduleFilter = e.target.value;
            const tableContainer = document.getElementById('log-table-container');
            if (tableContainer) tableContainer.innerHTML = renderLogTable();
        };
    }

    const dateInput = document.getElementById('filter-date-log');
    if (dateInput) {
        dateInput.onchange = (e) => {
            dateFilter = e.target.value;
            const tableContainer = document.getElementById('log-table-container');
            if (tableContainer) tableContainer.innerHTML = renderLogTable();
        };
    }
    
    const btnExport = document.getElementById('btn-export-log');
    if (btnExport) {
        btnExport.onclick = () => showToast('Mengekspor data audit log...');
    }
}
