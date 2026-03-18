export const renderBadge = (status) => {
    const statusMap = {
        'Berhasil': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Terverifikasi': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Menunggu': 'bg-amber-50 text-amber-700 border-amber-100',
        'Proses': 'bg-blue-50 text-blue-700 border-blue-100',
        'Dibatalkan': 'bg-rose-50 text-rose-700 border-rose-100',
        'Ditolak': 'bg-rose-50 text-rose-700 border-rose-100',
        'Aktif': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Non-Aktif': 'bg-slate-100 text-slate-500 border-slate-200'
    };

    const style = statusMap[status] || 'bg-slate-50 text-slate-500 border-slate-100';
    return `<span class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase border tracking-wider ${style}">${status}</span>`;
};

export const renderTable = ({ headers, data, renderRow }) => {
    return `
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/30">
                        ${headers.map(h => `<th class="px-6 py-4 font-black">${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    ${data.map(item => renderRow(item)).join('')}
                </tbody>
            </table>
        </div>
    `;
};

export const renderPageHeader = ({ title, subtitle, actions = [] }) => {
    return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 class="text-2xl font-black text-slate-800 tracking-tight">${title}</h1>
                <p class="text-slate-500 text-sm font-medium">${subtitle}</p>
            </div>
            <div class="flex gap-2">
                ${actions.map(action => `
                    <button id="${action.id}" class="${action.className || 'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95'}">
                        ${action.icon ? `<i data-lucide="${action.icon}" class="w-5 h-5"></i>` : ''}
                        <span>${action.label}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderEmptyState = (message = 'Belum ada data.', icon = 'database') => {
    const msg = typeof message === 'object' ? message.message : message;
    const ico = typeof message === 'object' ? message.icon : icon;
    return `
        <div class="flex flex-col items-center justify-center p-20 space-y-2">
            <i data-lucide="${ico}" class="w-12 h-12 text-slate-200"></i>
            <p class="text-slate-400 font-medium">${msg}</p>
        </div>
    `;
};

export const renderLoadingState = (message = 'Memuat data...') => {
    return `
        <div class="flex flex-col items-center justify-center p-20 space-y-4">
            <div class="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p class="text-sm text-slate-400 font-medium">${message}</p>
        </div>
    `;
};

export const renderErrorState = (message = 'Terjadi kesalahan saat memuat data.', onRetry = null) => {
    return `
        <div class="flex flex-col items-center justify-center p-20 space-y-6 text-center">
            <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100">
                <i data-lucide="alert-triangle" class="w-8 h-8"></i>
            </div>
            <div class="space-y-2">
                <h3 class="font-black text-slate-800 tracking-tight">Gagal Memuat Data</h3>
                <p class="text-slate-400 text-sm font-medium max-w-xs mx-auto">${message}</p>
            </div>
            ${onRetry ? `
                <button onclick="${onRetry}" class="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all">
                    Coba Lagi
                </button>
            ` : ''}
        </div>
    `;
};

export const showModal = ({ title, content, onSave, saveLabel = 'Simpan Data', saveClass = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' }) => {
    const modalHtml = `
        <div id="modal-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 class="font-black text-slate-800 text-xl tracking-tight">${title}</h3>
                    <button id="modal-close" class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <div class="p-8">
                    ${content}
                </div>
                <div class="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3">
                    <button id="modal-cancel" class="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Batal</button>
                    <button id="modal-save" class="px-8 py-3 text-sm font-black text-white ${saveClass} rounded-xl shadow-xl transition-all active:scale-95">${saveLabel}</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();

    const close = () => {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => modal.remove(), 200);
        }
    };

    document.getElementById('modal-close').onclick = close;
    document.getElementById('modal-cancel').onclick = close;
    document.getElementById('modal-save').onclick = async () => {
        const success = await onSave();
        if (success) close();
    };
};

export const showToast = (message, type = 'success') => {
    const toastHtml = `
        <div id="toast" class="fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-500 ${
            type === 'success' ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'
        }">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center ${type === 'success' ? 'bg-emerald-500' : 'bg-white/20'}">
                <i data-lucide="${type === 'success' ? 'check' : 'alert-circle'}" class="w-4 h-4 text-white"></i>
            </div>
            <span class="font-bold text-sm tracking-tight">${message}</span>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('animate-out', 'fade-out', 'slide-out-to-right-8');
            setTimeout(() => toast.remove(), 500);
        }
    }, 4000);
};
