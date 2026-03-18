import { formatIDR } from '../utils.js';
import { renderTable, renderBadge, renderLoadingState, renderErrorState } from '../ui.js';
import { apiGet } from '../api.js';

// 1. State & Data
let dashboardData = null;
let isLoading = false;
let error = null;
let selectedPeriod = 'Bulan Ini';

// 2. Initialization
export async function initDashboard(container) {
    window.retryDashboard = () => fetchData();
    renderLayout(container);
    fetchData();
}

// 3. Data Logic
async function fetchData() {
    isLoading = true;
    error = null;
    updateDashboardView();
    
    try {
        const result = await apiGet('getDashboardData', { period: selectedPeriod });
        dashboardData = result;
    } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
        error = err.message || 'Gagal terhubung ke server.';
    } finally {
        isLoading = false;
        updateDashboardView();
    }
}

// 4. UI Rendering
function renderLayout(container) {
    container.innerHTML = `
        <div id="dashboard-content" class="space-y-8 pb-12">
            ${renderLoadingState('Menyiapkan dashboard...')}
        </div>
    `;
}

function updateDashboardView() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = renderLoadingState('Memuat data dashboard...');
        return;
    }

    if (error) {
        container.innerHTML = renderErrorState(error, 'window.retryDashboard()');
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    if (!dashboardData || !dashboardData.stats) {
        console.error('Data dashboard tidak lengkap:', dashboardData);
        container.innerHTML = renderErrorState('Data dashboard tidak lengkap atau tidak valid.', 'window.retryDashboard()');
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    // Default values for missing arrays
    const recentIn = dashboardData.recentIn || [];
    const recentOut = dashboardData.recentOut || [];
    const activePrograms = dashboardData.activePrograms || [];
    const chartData = dashboardData.chartData || { labels: [], in: [], out: [] };

    container.innerHTML = `
        <!-- Header -->
        <div id="dashboard-header"></div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${renderStatCard('Saldo Kas Total', dashboardData.stats.totalBalance || 0, 'wallet', 'from-emerald-600 to-emerald-500')}
            ${renderStatCard(`Dana Masuk (${selectedPeriod})`, dashboardData.stats.totalIn || 0, 'arrow-down-circle', 'from-blue-600 to-blue-500')}
            ${renderStatCard(`Dana Keluar (${selectedPeriod})`, dashboardData.stats.totalOut || 0, 'arrow-up-circle', 'from-rose-600 to-rose-500')}
            ${renderStatCard('Jumlah Donatur', dashboardData.stats.donors || 0, 'users', 'from-slate-800 to-slate-700')}
            ${renderStatCard('Jumlah Mustahik', dashboardData.stats.mustahik || 0, 'user-round', 'from-indigo-600 to-indigo-500')}
            ${renderStatCard('Program Aktif', dashboardData.stats.programs || 0, 'target', 'from-amber-500 to-amber-400')}
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            ${renderChartContainer('Tren Penghimpunan (Juta Rp)', 'chart-in')}
            ${renderChartContainer('Tren Penyaluran (Juta Rp)', 'chart-out')}
        </div>

        <!-- Tables Section -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            ${renderRecentTrxTable('Donasi Masuk Terbaru', 'arrow-down-to-line', 'text-emerald-500', ['Tanggal', 'Donatur', 'Nominal', 'Status'], recentIn, 'in')}
            ${renderRecentTrxTable('Penyaluran Terbaru', 'arrow-up-from-line', 'text-rose-500', ['Tanggal', 'Program', 'Nominal', 'Status'], recentOut, 'out')}
        </div>

        <!-- Active Programs List -->
        <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 class="font-black text-slate-800 mb-6 tracking-tight">Program Berjalan</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${activePrograms.length > 0 
                    ? activePrograms.map(p => renderProgramItem(p)).join('') 
                    : '<p class="text-slate-400 text-sm italic col-span-3 text-center py-4">Tidak ada program aktif saat ini.</p>'}
            </div>
        </div>
    `;

    renderHeader();
    attachHeaderEvents();
    setupCharts(chartData);
    if (window.lucide) window.lucide.createIcons();
}

function attachHeaderEvents() {
    const buttons = document.querySelectorAll('#dashboard-header button[data-period]');
    buttons.forEach(btn => {
        btn.onclick = () => {
            const period = btn.getAttribute('data-period');
            if (period && period !== selectedPeriod) {
                selectedPeriod = period;
                fetchData();
            }
        };
    });
}

function renderHeader() {
    const headerContainer = document.getElementById('dashboard-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-black text-slate-800 tracking-tight">Ringkasan Eksekutif</h1>
                <p class="text-slate-500 text-sm font-medium">Laporan performa ZISWAF periode terpilih.</p>
            </div>
            <div class="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                ${['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini'].map(p => `
                    <button data-period="${p}" class="px-4 py-2 text-xs font-bold rounded-xl transition-all ${p === selectedPeriod ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}">
                        ${p}
                    </button>
                `).join('')}
                <button class="p-2 text-slate-300 hover:text-emerald-600 border-l border-slate-50 ml-1">
                    <i data-lucide="calendar" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

function renderStatCard(title, value, icon, gradient) {
    return `
        <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group card-hover">
            <div class="flex items-center justify-between mb-6">
                <div class="w-14 h-14 bg-gradient-to-br ${gradient} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform duration-500">
                    <i data-lucide="${icon}" class="w-6 h-6"></i>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
                </div>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">${title}</p>
            <h3 class="text-2xl font-black text-slate-800 tracking-tight">
                ${typeof value === 'number' ? formatIDR(value) : value}
            </h3>
        </div>
    `;
}

function renderChartContainer(title, id) {
    return `
        <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 class="font-black text-slate-800 mb-6 tracking-tight">${title}</h3>
            <canvas id="${id}" height="200"></canvas>
        </div>
    `;
}

function renderRecentTrxTable(title, icon, iconColor, headers, data, type) {
    return `
        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div class="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 class="font-black text-slate-800 tracking-tight">${title}</h3>
                <i data-lucide="${icon}" class="${iconColor} w-5 h-5"></i>
            </div>
            ${renderTable({
                headers: headers,
                data: data,
                renderRow: (item) => `
                    <tr class="text-sm hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td class="px-6 py-4 text-slate-500 font-medium">${item.date}</td>
                        <td class="px-6 py-4 font-bold text-slate-800">${item.name || item.program}</td>
                        <td class="px-6 py-4 font-black ${type === 'in' ? 'text-emerald-600' : 'text-rose-600'}">${formatIDR(item.amount)}</td>
                        <td class="px-6 py-4">${renderBadge(item.status)}</td>
                    </tr>
                `
            })}
        </div>
    `;
}

function renderProgramItem(p) {
    return `
        <div class="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
            <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">${p.category}</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${p.progress}%</span>
            </div>
            <h4 class="font-bold text-slate-800 text-sm mb-4 group-hover:text-emerald-600 transition-colors">${p.name}</h4>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000" style="width: ${p.progress}%"></div>
            </div>
        </div>
    `;
}

function setupCharts(chartData) {
    if (!window.Chart) return;

    const ctxIn = document.getElementById('chart-in').getContext('2d');
    const ctxOut = document.getElementById('chart-out').getContext('2d');

    const commonOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { 
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    new Chart(ctxIn, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.in,
                backgroundColor: '#10b981',
                borderRadius: 12
            }]
        },
        options: commonOptions
    });

    new Chart(ctxOut, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.out,
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.05)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#f43f5e'
            }]
        },
        options: commonOptions
    });
}

