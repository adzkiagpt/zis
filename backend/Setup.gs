/**
 * Setup.gs
 * Fungsi untuk inisialisasi Spreadsheet (Membuat sheet dan header)
 */

function setupSpreadsheet() {
  const sheets = [
    {
      name: SHEETS.USERS,
      headers: ['user_id', 'full_name', 'email', 'username', 'password', 'role', 'status', 'created_at']
    },
    {
      name: SHEETS.DONATUR,
      headers: ['donatur_id', 'nama_lengkap', 'email', 'no_hp', 'alamat', 'kategori', 'status', 'total_donasi', 'keterangan', 'created_at']
    },
    {
      name: SHEETS.MUSTAHIK,
      headers: ['mustahik_id', 'nama_lengkap', 'nik', 'alamat', 'no_hp', 'wilayah', 'asnaf', 'program_utama', 'status', 'keterangan', 'created_at']
    },
    {
      name: SHEETS.PROGRAM,
      headers: ['program_id', 'nama_program', 'kategori', 'jenis_dana', 'target_dana', 'status', 'pic', 'tgl_mulai', 'tgl_selesai', 'deskripsi', 'collected', 'created_at']
    },
    {
      name: SHEETS.TRANSAKSI_MASUK,
      headers: ['transaksi_id', 'tanggal', 'nama_donatur', 'fund_type', 'nominal', 'status', 'created_at', 'donatur_id', 'program_id', 'metode', 'keterangan']
    },
    {
      name: SHEETS.TRANSAKSI_KELUAR,
      headers: ['transaksi_id', 'tanggal', 'nama_program', 'receiver_name', 'fund_type', 'nominal', 'status', 'created_at', 'program_id', 'mustahik_id', 'metode', 'keterangan', 'doc_url']
    },
    {
      name: SHEETS.AUDIT_LOG,
      headers: ['log_id', 'waktu', 'nama_user', 'user_id', 'aksi', 'modul', 'id_data', 'detail', 'ip_address']
    },
    {
      name: SHEETS.SETTINGS,
      headers: ['key', 'value']
    },
    {
      name: SHEETS.JENIS_DANA,
      headers: ['id_dana', 'nama_dana', 'kategori', 'keterangan']
    }
  ];

  sheets.forEach(s => {
    let sheet = getSS().getSheetByName(s.name);
    if (!sheet) {
      sheet = getSS().insertSheet(s.name);
      sheet.appendRow(s.headers);
      // Format header
      sheet.getRange(1, 1, 1, s.headers.length).setFontWeight('bold').setBackground('#f3f4f6');
    } else {
      // Jika sheet sudah ada, pastikan header di baris pertama sesuai
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0].map(h => String(h).trim());
      const isMatch = s.headers.length === currentHeaders.length && s.headers.every((h, i) => currentHeaders[i] === h);
      
      if (!isMatch || sheet.getLastRow() === 0) {
        // Jika header tidak cocok atau sheet kosong, kita timpa baris pertama
        // Tapi hati-hati, jangan hapus data. Kita hanya pastikan baris pertama adalah header yang benar.
        // Jika sheet kosong, appendRow. Jika tidak, setValues di baris 1.
        if (sheet.getLastRow() === 0) {
          sheet.appendRow(s.headers);
        } else {
          // Kita asumsikan baris 1 adalah header, kita timpa saja
          // Jika kolom yang ada lebih sedikit, kita perlu perluas
          sheet.getRange(1, 1, 1, s.headers.length).setValues([s.headers]);
        }
        sheet.getRange(1, 1, 1, s.headers.length).setFontWeight('bold').setBackground('#f3f4f6');
      }
    }
  });

  // Tambahkan user admin default jika belum ada
  const userSheet = getSS().getSheetByName(SHEETS.USERS);
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow(['USR-001', 'Super Admin', 'admin@ziswaf.org', 'admin', 'admin123', 'Super Admin', 'Aktif', new Date()]);
  }

  // Tambahkan settings default jika belum ada
  const settingsSheet = getSS().getSheetByName(SHEETS.SETTINGS);
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(['nama_lembaga', 'Lembaga ZISWAF Berkah']);
    settingsSheet.appendRow(['alamat_lembaga', 'Jl. Keadilan No. 123']);
    settingsSheet.appendRow(['kontak_whatsapp', '081234567890']);
  }

  // Tambahkan jenis dana default jika belum ada
  const danaSheet = getSS().getSheetByName(SHEETS.JENIS_DANA);
  if (danaSheet.getLastRow() <= 1) {
    danaSheet.appendRow(['D-001', 'Zakat', 'Zakat', 'Zakat Maal/Fitrah']);
    danaSheet.appendRow(['D-002', 'Infaq', 'Infaq', 'Infaq Umum']);
    danaSheet.appendRow(['D-003', 'Shadaqah', 'Shadaqah', 'Shadaqah']);
    danaSheet.appendRow(['D-004', 'Wakaf', 'Wakaf', 'Wakaf Tunai']);
  }

  return "Setup Berhasil! Semua sheet dan header telah dibuat.";
}
