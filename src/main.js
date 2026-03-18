import { initDashboard } from './pages/dashboard.js';
import { initDonatur } from './pages/donatur.js';
import { initMustahik } from './pages/mustahik.js';
import { initProgram } from './pages/program.js';
import { initTrxMasuk } from './pages/trx-masuk.js';
import { initTrxKeluar } from './pages/trx-keluar.js';
import { initLaporan } from './pages/laporan.js';
import { initPengguna } from './pages/pengguna.js';
import { initPengaturan } from './pages/pengaturan.js';
import { initAuditLog } from './pages/audit-log.js';
import { renderLoadingState } from './ui.js';
import { API_URL, DEMO_MODE } from './api.js';
import { ensureInitialData } from './dataStore.js';

/**
 * Configuration
 */
const IS_DEMO = DEMO_MODE || API_URL.includes('EXAMPLE-URL');
const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', init: initDashboard },
    { id: 'donatur', label: 'Donatur', icon: 'users', init: initDonatur },
    { id: 'mustahik', label: 'Mustahik', icon: 'user-round', init: initMustahik },
    { id: 'program', label: 'Program', icon: 'target', init: initProgram },
    { id: 'trx-masuk', label: 'Transaksi Masuk', icon: 'arrow-down-circle', init: initTrxMasuk },
    { id: 'trx-keluar', label: 'Transaksi Keluar', icon: 'arrow-up-circle', init: initTrxKeluar },
    { id: 'laporan', label: 'Laporan', icon: 'file-text', init: initLaporan },
    { id: 'pengguna', label: 'Pengguna', icon: 'user-cog', init: initPengguna },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'settings', init: initPengaturan },
    { id: 'audit-log', label: 'Audit Log', icon: 'history', init: initAuditLog },
];

/**
 * DOM Elements
 */
const sidebarNav = document.getElementById('sidebar-nav');
const pageTitle = document.getElementById('page-title');
const appContent = document.getElementById('app-content');
const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
const sidebar = document.getElementById('sidebar');

/**
 * Navigation Logic
 */
export function navigateTo(pageId) {
    const menu = MENU_ITEMS.find(m => m.id === pageId) || MENU_ITEMS[0];
    
    // Update Sidebar UI
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-page') === pageId);
    });

    // Update Header
    pageTitle.textContent = menu.label;
    
    // Show Loading State
    appContent.innerHTML = renderLoadingState('Memuat Halaman...');
    if (window.lucide) window.lucide.createIcons();
    
    // Initialize Page
    setTimeout(() => {
        if (typeof menu.init === 'function') {
            menu.init(appContent);
        } else {
            renderPlaceholder(menu.label);
        }
        
        if (window.lucide) window.lucide.createIcons();
    }, 300);
}

/**
 * UI Helpers
 */
function renderSidebar() {
    sidebarNav.innerHTML = `
        <div class="px-4 mb-8">
            <div class="flex items-center gap-3 px-2 py-4">
                <div class="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <i data-lucide="heart" class="text-white w-6 h-6"></i>
                </div>
                <div class="sidebar-text">
                    <h2 class="font-black text-slate-800 tracking-tight leading-none">ZISWAF</h2>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Portal</p>
                </div>
            </div>
            ${IS_DEMO ? `
                <div class="mt-2 px-2">
                    <div class="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3">
                        <i data-lucide="alert-circle" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
                        <div class="sidebar-text">
                            <p class="text-[10px] font-black text-amber-800 uppercase tracking-tight">Demo Mode</p>
                            <p class="text-[9px] text-amber-600 font-medium leading-tight mt-0.5">Hubungkan API di src/api.js untuk data riil.</p>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="space-y-1 px-2">
            ${MENU_ITEMS.map(item => `
                <div data-page="${item.id}" class="sidebar-item group">
                    <i data-lucide="${item.icon}" class="w-5 h-5 transition-transform group-hover:scale-110"></i>
                    <span class="sidebar-text">${item.label}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    if (window.lucide) window.lucide.createIcons();

    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.addEventListener('click', () => navigateTo(el.getAttribute('data-page')));
    });
}

function renderPlaceholder(label) {
    appContent.innerHTML = `
        <div class="p-8 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 class="text-xl font-black text-slate-800 tracking-tight">Modul ${label}</h3>
            <p class="text-slate-500 mt-2 font-medium">Halaman ini sedang dalam tahap pengembangan.</p>
        </div>
    `;
}

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', async () => {
    renderSidebar();
    
    // Pre-fetch all master data to speed up page navigation
    appContent.innerHTML = renderLoadingState('Menyiapkan Sistem...');
    await ensureInitialData();
    
    navigateTo('dashboard');
    
    btnToggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-20');
        document.querySelectorAll('.sidebar-text').forEach(el => el.classList.toggle('hidden'));
    });
});
