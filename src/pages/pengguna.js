import { renderBadge, renderTable, showModal, showToast, renderPageHeader, renderLoadingState } from '../ui.js';
import { apiGet, apiPost } from '../api.js';
import { getCachedData, updateCache } from '../dataStore.js';

// 1. State
let users = [];
let isLoading = false;
let searchTerm = '';
let roleFilter = '';
let statusFilter = '';

// 2. Initialization
export async function initPengguna(container) {
    renderLayout(container);
    fetchData();
}

// 3. Data Logic
async function fetchData(force = false) {
    isLoading = true;
    updateTableView();
    
    try {
        if (!force) {
            const cached = getCachedData('users');
            if (cached) {
                users = cached;
                isLoading = false;
                updateTableView();
                return;
            }
        }

        const result = await apiGet('getUsers');
        users = Array.isArray(result) ? result : [];
        updateCache('users', users);
    } catch (error) {
        showToast('Gagal mengambil data: ' + error.message, 'error');
    } finally {
        isLoading = false;
        updateTableView();
    }
}

async function handleSave(data, isEdit) {
    try {
        const action = isEdit ? 'updateUser' : 'addUser';
        await apiPost(action, data);
        showToast(isEdit ? 'Data pengguna diperbarui' : 'Pengguna baru ditambahkan');
        fetchData();
        return true;
    } catch (error) {
        showToast('Gagal menyimpan: ' + error.message, 'error');
        return false;
    }
}

async function handleDelete(id, fullName) {
    showModal({
        title: 'Konfirmasi Hapus',
        content: `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <i data-lucide="trash-2" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-slate-600">Hapus pengguna <span class="font-black text-slate-800">${fullName}</span> secara permanen?</p>
                    <p class="text-xs text-slate-400 mt-2">Akses pengguna ini akan segera dicabut.</p>
                </div>
            </div>
        `,
        saveLabel: 'Ya, Hapus',
        saveClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
        onSave: async () => {
            try {
                await apiPost('deleteUser', { id });
                showToast('Pengguna dihapus');
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
        <div id="pengguna-content" class="space-y-6 pb-10">
            ${renderLoadingState('Menyiapkan manajemen pengguna...')}
        </div>
    `;
}

function updateTableView() {
    const container = document.getElementById('pengguna-content');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data pengguna...');
        return;
    }

    container.innerHTML = `
        ${renderPageHeader({
            title: 'Manajemen Pengguna',
            subtitle: 'Kelola akses admin dan staf lembaga ZISWAF.',
            actions: [
                { id: 'btn-add-user', label: 'Tambah Pengguna', icon: 'user-plus' }
            ]
        })}

        <!-- Filter Bar -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
            <div class="relative flex-1">
                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                <input type="text" id="search-user" value="${searchTerm}" placeholder="Cari nama, email, atau username..." class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium">
            </div>
            <div class="flex flex-wrap gap-2">
                <select id="filter-role" class="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none">
                    <option value="">Semua Role</option>
                    <option value="Super Admin" ${roleFilter === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                    <option value="Amil" ${roleFilter === 'Amil' ? 'selected' : ''}>Amil</option>
                    <option value="Staf Lapangan" ${roleFilter === 'Staf Lapangan' ? 'selected' : ''}>Staf Lapangan</option>
                </select>
                <select id="filter-status-user" class="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none">
                    <option value="">Semua Status</option>
                    <option value="Aktif" ${statusFilter === 'Aktif' ? 'selected' : ''}>Aktif</option>
                    <option value="Nonaktif" ${statusFilter === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                </select>
            </div>
        </div>

        <!-- Table Container -->
        <div id="user-table-container" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            ${renderUserTable()}
        </div>
    `;

    attachEvents();
    if (window.lucide) window.lucide.createIcons();
}

function renderUserTable() {
    const filteredData = users.filter(u => {
        const matchesSearch = (u.fullName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                             (u.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                             (u.username || '').toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesRole = roleFilter === '' || u.role === roleFilter;
        const matchesStatus = statusFilter === '' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return renderTable({
        headers: ['Nama Lengkap', 'Username / Email', 'Role', 'Status', 'Login Terakhir', 'Aksi'],
        data: filteredData,
        renderRow: (item) => `
            <tr class="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm uppercase border border-emerald-100">
                            ${item.fullName.charAt(0)}
                        </div>
                        <div class="font-black text-slate-800">${item.fullName}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-slate-700 font-black">@${item.username}</div>
                    <div class="text-[10px] text-slate-400 font-bold">${item.email}</div>
                </td>
                <td class="px-6 py-4 text-xs font-bold text-slate-600">${item.role}</td>
                <td class="px-6 py-4">${renderBadge(item.status)}</td>
                <td class="px-6 py-4 text-[10px] font-mono text-slate-400 font-bold">${item.lastLogin || '-'}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.handleUserAction('reset', '${item.id}')" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors" title="Reset Password"><i data-lucide="key-round" class="w-4 h-4"></i></button>
                        <button onclick="window.handleUserAction('edit', '${item.id}')" class="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button onclick="window.handleUserAction('toggle', '${item.id}')" class="p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-600 transition-colors" title="${item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}"><i data-lucide="${item.status === 'Aktif' ? 'user-x' : 'user-check'}" class="w-4 h-4"></i></button>
                        <button onclick="window.handleUserAction('delete', '${item.id}')" class="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `
    });
}

function attachEvents() {
    const searchInput = document.getElementById('search-user');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchTerm = e.target.value;
            const tableContainer = document.getElementById('user-table-container');
            if (tableContainer) tableContainer.innerHTML = renderUserTable();
        };
    }

    const roleSelect = document.getElementById('filter-role');
    if (roleSelect) {
        roleSelect.onchange = (e) => {
            roleFilter = e.target.value;
            const tableContainer = document.getElementById('user-table-container');
            if (tableContainer) tableContainer.innerHTML = renderUserTable();
        };
    }

    const statusSelect = document.getElementById('filter-status-user');
    if (statusSelect) {
        statusSelect.onchange = (e) => {
            statusFilter = e.target.value;
            const tableContainer = document.getElementById('user-table-container');
            if (tableContainer) tableContainer.innerHTML = renderUserTable();
        };
    }

    const btnAdd = document.getElementById('btn-add-user');
    if (btnAdd) {
        btnAdd.onclick = () => openUserModal();
    }

    window.handleUserAction = (action, id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        switch(action) {
            case 'edit': openUserModal(user); break;
            case 'reset': handleResetPassword(user); break;
            case 'toggle': handleToggleStatus(user); break;
            case 'delete': confirmDelete(id, user.fullName); break;
        }
    };
}

function openUserModal(user = null) {
    const isEdit = !!user;
    showModal({
        title: isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru',
        content: `
            <form id="form-user" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2 md:col-span-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap *</label>
                    <input type="text" id="u-name" value="${user?.fullName || ''}" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email *</label>
                    <input type="email" id="u-email" value="${user?.email || ''}" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username *</label>
                    <input type="text" id="u-username" value="${user?.username || ''}" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                </div>
                ${!isEdit ? `
                <div class="space-y-2 md:col-span-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password *</label>
                    <input type="password" id="u-password" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium">
                </div>
                ` : ''}
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role *</label>
                    <select id="u-role" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-slate-600">
                        <option value="Amil" ${user?.role === 'Amil' ? 'selected' : ''}>Amil</option>
                        <option value="Staf Lapangan" ${user?.role === 'Staf Lapangan' ? 'selected' : ''}>Staf Lapangan</option>
                        <option value="Super Admin" ${user?.role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status *</label>
                    <select id="u-status" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-slate-600">
                        <option value="Aktif" ${user?.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                        <option value="Nonaktif" ${user?.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                    </select>
                </div>
            </form>
        `,
        onSave: () => {
            const fullName = document.getElementById('u-name').value;
            const email = document.getElementById('u-email').value;
            const username = document.getElementById('u-username').value;
            const role = document.getElementById('u-role').value;
            const status = document.getElementById('u-status').value;

            if (!fullName || !email || !username || !role || !status) {
                showToast('Lengkapi seluruh data wajib!', 'error');
                return false;
            }

            // Uniqueness Validation (Simulation)
            const emailExists = users.some(u => u.email === email && u.id !== user?.id);
            const usernameExists = users.some(u => u.username === username && u.id !== user?.id);

            if (emailExists || usernameExists) {
                showToast('Email atau Username sudah digunakan!', 'error');
                return false;
            }

            const data = {
                id: user?.id,
                fullName,
                email,
                username,
                role,
                status
            };

            if (!isEdit) {
                data.password = document.getElementById('u-password').value;
            }

            return handleSave(data, isEdit);
        }
    });
}

async function handleResetPassword(user) {
    showModal({
        title: 'Reset Password',
        content: `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <i data-lucide="key-round" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-slate-600">Reset password untuk <span class="font-black text-slate-800">${user.fullName}</span>?</p>
                    <p class="text-xs text-slate-400 mt-2">Password baru akan dikirimkan ke email <span class="font-bold">${user.email}</span>.</p>
                </div>
            </div>
        `,
        saveLabel: 'Reset Password',
        saveClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
        onSave: async () => {
            try {
                await apiPost('resetUserPassword', { id: user.id });
                showToast(`Password @${user.username} telah direset.`);
                return true;
            } catch (error) {
                showToast('Gagal reset password: ' + error.message, 'error');
                return false;
            }
        }
    });
    if (window.lucide) window.lucide.createIcons();
}

async function handleToggleStatus(user) {
    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    showModal({
        title: `${newStatus === 'Nonaktif' ? 'Nonaktifkan' : 'Aktifkan'} Akun`,
        content: `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 ${newStatus === 'Nonaktif' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} rounded-2xl flex items-center justify-center mx-auto">
                    <i data-lucide="${newStatus === 'Nonaktif' ? 'user-x' : 'user-check'}" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-slate-600">${newStatus === 'Nonaktif' ? 'Nonaktifkan' : 'Aktifkan'} akun <span class="font-black text-slate-800">${user.fullName}</span>?</p>
                </div>
            </div>
        `,
        saveLabel: newStatus === 'Nonaktif' ? 'Nonaktifkan' : 'Aktifkan',
        saveClass: newStatus === 'Nonaktif' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
        onSave: async () => {
            try {
                await apiPost('updateUserStatus', { id: user.id, status: newStatus });
                showToast(`Status pengguna diubah menjadi ${newStatus}`);
                fetchData();
                return true;
            } catch (error) {
                showToast('Gagal mengubah status: ' + error.message, 'error');
                return false;
            }
        }
    });
    if (window.lucide) window.lucide.createIcons();
}

function confirmDelete(id, fullName) {
    handleDelete(id, fullName);
}
