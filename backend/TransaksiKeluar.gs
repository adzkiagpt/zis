/**
 * TransaksiKeluar.gs
 */

function addTransaksiKeluar(data, auth) {
  const trxData = {
    transaksi_id: generateId('TRX-OUT-', SHEETS.TRANSAKSI_KELUAR),
    tanggal: new Date(data.tanggal || data.date),
    nama_program: data.nama_program || data.programName || '-',
    receiver_name: data.receiver_name || data.receiverName || '-',
    fund_type: data.fund_type || data.fundType || 'Zakat',
    nominal: Number(data.nominal || data.amount || 0),
    status: data.status || 'Menunggu',
    created_at: new Date(),
    program_id: data.program_id || data.programId,
    mustahik_id: data.mustahik_id || data.mustahikId,
    metode: data.metode || data.method,
    keterangan: data.keterangan || data.note,
    doc_url: data.doc_url || data.docUrl
  };
  
  const result = appendRow(SHEETS.TRANSAKSI_KELUAR, trxData);
  logAudit(auth.userId, auth.namaUser, 'CREATE', 'Transaksi Keluar', trxData.transaksi_id, 'Penyaluran ke ' + trxData.receiver_name + ' sebesar ' + trxData.nominal);
  return result;
}

function updateTransaksiKeluar(data, auth) {
  const result = updateRowById(SHEETS.TRANSAKSI_KELUAR, 'transaksi_id', data.transaksi_id, data);
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Transaksi Keluar', data.transaksi_id, 'Update transaksi keluar ID: ' + data.transaksi_id);
  return result;
}

function deleteTransaksiKeluar(id, auth) {
  const result = deleteRowById(SHEETS.TRANSAKSI_KELUAR, 'transaksi_id', id);
  logAudit(auth.userId, auth.namaUser, 'DELETE', 'Transaksi Keluar', id, 'Hapus transaksi keluar ID: ' + id);
  return result;
}
