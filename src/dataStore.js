/**
 * dataStore.js
 * Centralized data management with caching to improve performance
 */
import { apiGet } from './api.js';
import { showToast } from './ui.js';

const cache = {
    donatur: null,
    mustahik: null,
    program: null,
    settings: null,
    balance: null,
    users: null,
    lastFetch: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function ensureInitialData(force = false) {
    const now = Date.now();
    if (!force && cache.lastFetch && (now - cache.lastFetch < CACHE_DURATION)) {
        return cache;
    }

    try {
        const res = await apiGet('getInitialData');
        if (res) {
            cache.donatur = res.donatur || [];
            cache.mustahik = res.mustahik || [];
            cache.program = res.program || [];
            cache.settings = res.settings || [];
            cache.balance = res.balance || {};
            cache.users = res.users || [];
            cache.lastFetch = now;
        }
        return cache;
    } catch (error) {
        console.error('Failed to fetch initial data:', error);
        showToast(`Gagal memuat data awal: ${error.message}`, 'error');
        return cache;
    }
}

export function getCachedData(key) {
    return cache[key];
}

export function updateCache(key, data) {
    cache[key] = data;
}

export function clearCache() {
    Object.keys(cache).forEach(key => cache[key] = null);
}
