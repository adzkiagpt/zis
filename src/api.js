/**
 * api.js
 * Service untuk komunikasi dengan Google Apps Script Backend
 */

// Ganti dengan Web App URL dari hasil Deploy Google Apps Script Anda
export const API_URL = 'https://script.google.com/macros/s/AKfycbxBnRZQxEjh8AVsw-U9mScIRW1d-CrTjRBADtDsF2SxA5i0U-K6B-1xbiXkxRshXdOx/exec';

// Mode Demo: Jika true, akan menggunakan data dummy (selalu)
// Set ke false jika sudah siap menggunakan data riil dari Google Sheets
export const DEMO_MODE = false;

import { showToast } from './ui.js';

/**
 * Helper untuk request GET
 */
export async function apiGet(action, params = {}) {
    // Jika Mode Demo aktif, langsung gunakan data dummy
    if (DEMO_MODE) {
        console.warn(`[Demo Mode] Menggunakan data dummy untuk aksi: ${action}`);
        return new Promise(resolve => setTimeout(() => resolve(getMockData(action)), 500));
    }

    const queryString = new URLSearchParams({ action, ...params }).toString();
    const fullUrl = `${API_URL}?${queryString}`;

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.error) throw new Error(result.error);
        return result;
    } catch (error) {
        console.group(`%c API Connection Error [${action}] `, 'background: #fee2e2; color: #991b1b; font-weight: bold;');
        console.error('Message:', error.message);
        console.warn('URL yang diakses:', fullUrl);
        console.warn('TIPS DIAGNOSA:');
        console.warn('1. Klik URL di atas. Jika muncul error "Spreadsheet not found", periksa SPREADSHEET_ID di Config.gs.');
        console.warn('2. Jika muncul "Authorization required", pastikan Deployment diset ke "Who has access: Anyone".');
        console.warn('3. Jika muncul "Action not found", pastikan file Main.gs sudah ter-copy dengan benar.');
        console.groupEnd();

        if (DEMO_MODE) {
            showToast('Koneksi API gagal. Menggunakan data simulasi.', 'error');
            return getMockData(action);
        }
        
        throw new Error(`Koneksi Gagal: ${error.message}. Klik kanan > Inspect > Console untuk detail.`);
    }
}

/**
 * Helper untuk request POST
 */
export async function apiPost(action, data = {}) {
    if (DEMO_MODE) {
        console.warn(`[Demo Mode] Simulasi POST berhasil untuk aksi: ${action}`);
        return new Promise(resolve => setTimeout(() => resolve({ success: true, data: { id: 'MOCK-' + Date.now() } }), 500));
    }

    const auth = { userId: 'USR-001', namaUser: 'Super Admin' };
    const payload = { action, data, auth };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            body: JSON.stringify(payload),
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.error) throw new Error(result.error);
        return result;
    } catch (error) {
        console.error(`API POST Error [${action}]:`, error.message);
        
        // Fallback untuk POST (simulasi berhasil)
        showToast('Gagal mengirim data ke server. Simulasi berhasil (Offline Mode).', 'error');
        console.info(`%c [Auto-Fallback] Simulasi POST berhasil karena koneksi gagal. `, 'color: #059669; font-weight: bold;');
        return { success: true, message: 'Simulasi berhasil (Fallback)', data: { id: 'FALLBACK-' + Date.now() } };
    }
}

/**
 * Mock Data untuk Demo Mode
 */
function getMockData(action) {
    const mockData = {
        getInitialData: {
            donatur: [
                { donatur_id: 'DON-001', nama_lengkap: 'Hamba Allah', email: 'hamba@allah.com', no_hp: '08123456789', total_donasi: 15000000, status: 'Aktif', kategori: 'Individu' }
            ],
            mustahik: [
                { mustahik_id: 'MUS-001', nama_lengkap: 'Ahmad Subarjo', asnaf: 'Fakir', status: 'Aktif' }
            ],
            program: [
                { program_id: 'PRG-001', nama_program: 'Beasiswa Santri', kategori: 'Pendidikan', jenis_dana: 'Zakat', target_dana: 100000000, status: 'Aktif', pic: 'Admin', collected: 75000000 },
                { program_id: 'PRG-002', nama_program: 'Sembako Berkah', kategori: 'Kemanusiaan', jenis_dana: 'Infaq', target_dana: 50000000, status: 'Aktif', pic: 'Admin', collected: 10000000 }
            ],
            settings: {
                nama_lembaga: 'Lembaga ZISWAF Berkah',
                alamat_lembaga: 'Jl. Keadilan No. 123',
                kontak_whatsapp: '081234567890'
            },
            balance: {
                'Zakat': 150000000,
                'Infaq': 75000000,
                'Wakaf': 200000000,
                'Shadaqah': 25000000
            },
            users: [
                { id: 'USR-001', fullName: 'Super Admin', email: 'admin@ziswaf.org', username: 'admin', role: 'Super Admin', status: 'Aktif' }
            ]
        },
        getDashboardData: {
            stats: { totalBalance: 1250450000, totalIn: 45200000, totalOut: 32150000, donors: 1240, mustahik: 850, programs: 12 },
            recentIn: [
                { date: '17 Mar', name: 'Hamba Allah', amount: 5000000, status: 'Berhasil' },
                { date: '16 Mar', name: 'Budi Santoso', amount: 250000, status: 'Berhasil' }
            ],
            recentOut: [
                { date: '17 Mar', program: 'Beasiswa Santri', amount: 12000000, status: 'Berhasil' }
            ],
            activePrograms: [
                { name: 'Beasiswa Santri', category: 'Pendidikan', progress: 75 },
                { name: 'RS Gratis Dhuafa', category: 'Kesehatan', progress: 42 }
            ],
            chartData: {
                labels: ['Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar'],
                in: [32, 45, 50, 38, 42, 45],
                out: [28, 30, 45, 32, 35, 32]
            }
        },
        getDonatur: [
            { donatur_id: 'DON-001', nama_lengkap: 'Hamba Allah', email: 'hamba@allah.com', no_hp: '08123456789', total_donasi: 15000000, status: 'Aktif', kategori: 'Individu' }
        ],
        getMustahik: [
            { id: 'MUS-001', name: 'Ahmad Subarjo', asnaf: 'Fakir', status: 'Aktif' }
        ],
        getProgram: [
            { program_id: 'PRG-001', nama_program: 'Beasiswa Santri', kategori: 'Pendidikan', jenis_dana: 'Zakat', target_dana: 100000000, status: 'Aktif', pic: 'Admin', collected: 75000000 }
        ],
        getTrxMasuk: [
            { id: 'TRX-IN-001', date: '2026-03-17', donorName: 'Hamba Allah', fundType: 'Zakat', amount: 5000000, status: 'Berhasil' }
        ],
        getTrxKeluar: [
            { id: 'TRX-OUT-001', date: '2026-03-17', receiverName: 'Ahmad Subarjo', fundType: 'Zakat', amount: 1500000, status: 'Berhasil' }
        ],
        getBalance: {
            'Zakat': 150000000,
            'Infaq': 75000000,
            'Wakaf': 200000000,
            'Shadaqah': 25000000
        },
        getUsers: [
            { id: 'USR-001', fullName: 'Super Admin', email: 'admin@ziswaf.org', username: 'admin', role: 'Super Admin', status: 'Aktif' }
        ],
        getSettings: {
            nama_lembaga: 'Lembaga ZISWAF Berkah',
            alamat_lembaga: 'Jl. Keadilan No. 123',
            kontak_whatsapp: '081234567890'
        },
        getAuditLogs: [
            { id: 'LOG-001', time: '2026-03-17 10:25:30', user: 'Super Admin', action: 'CREATE', module: 'Transaksi Masuk', detail: 'Menambahkan donasi', ip: '127.0.0.1' }
        ],
        getReportData: {
            penerimaan: [],
            penyaluran: [],
            saldo: [],
            donatur: [],
            mustahik: [],
            program: []
        }
    };

    return mockData[action] || [];
}
