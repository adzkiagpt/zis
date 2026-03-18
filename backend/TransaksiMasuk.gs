/**
 * TransaksiMasuk.gs
 */

function addTransaksiMasuk(data, auth) {
  const trxData = {
    transaksi_id: generateId('TRX-IN-', SHEETS.TRANSAKSI_MASUK),
    tanggal: new Date(data.tanggal || data.date),
    nama_donatur: data.nama_donatur || data.donorName || '-',
    fund_type: data.fund_type || data.fundType || 'Zakat',
    nominal: Number(data.nominal || data.amount || 0),
    status: data.status || 'Menunggu',
    created_at: new Date(),
    donatur_id: data.donatur_id || data.donorId,
    program_id: data.program_id || data.programId,
    metode: data.metode || data.method,
    keterangan: data.keterangan || data.note
  };
  
  const result = appendRow(SHEETS.TRANSAKSI_MASUK, trxData);
  logAudit(auth.userId, auth.namaUser, 'CREATE', 'Transaksi Masuk', trxData.transaksi_id, 'Donasi masuk dari ' + trxData.nama_donatur + ' sebesar ' + trxData.nominal);
  return result;
}

function updateTransaksiMasuk(data, auth) {
  const result = updateRowById(SHEETS.TRANSAKSI_MASUK, 'transaksi_id', data.transaksi_id, data);
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Transaksi Masuk', data.transaksi_id, 'Update transaksi masuk ID: ' + data.transaksi_id);
  return result;
}

function deleteTransaksiMasuk(id, auth) {
  const result = deleteRowById(SHEETS.TRANSAKSI_MASUK, 'transaksi_id', id);
  logAudit(auth.userId, auth.namaUser, 'DELETE', 'Transaksi Masuk', id, 'Hapus transaksi masuk ID: ' + id);
  return result;
}

function updateTrxMasukStatus(data, auth) {
  const result = updateRowById(SHEETS.TRANSAKSI_MASUK, 'transaksi_id', data.id, { status: data.status });
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Transaksi Masuk', data.id, 'Verifikasi transaksi masuk ID: ' + data.id);
  return result;
}
