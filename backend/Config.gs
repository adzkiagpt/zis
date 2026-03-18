/**
 * Config.gs
 * Konfigurasi global aplikasi
 */

const SPREADSHEET_ID = '1kDqFfXqyaOuTp4xhBuFpHgjEttEbcyQXTi7Vo2fEOUg';
let _ss = null;

function getSS() {
  if (!_ss) {
    try {
      _ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      console.error('Gagal membuka Spreadsheet:', e.message);
      throw new Error('Spreadsheet tidak dapat diakses. Periksa SPREADSHEET_ID di Config.gs.');
    }
  }
  return _ss;
}

const SHEETS = {
  USERS: 'users',
  DONATUR: 'donatur',
  MUSTAHIK: 'mustahik',
  PROGRAM: 'program',
  JENIS_DANA: 'jenis_dana',
  ASNAF: 'asnaf',
  TRANSAKSI_MASUK: 'transaksi_masuk',
  TRANSAKSI_KELUAR: 'transaksi_keluar',
  AUDIT_LOG: 'audit_log',
  SETTINGS: 'settings'
};
