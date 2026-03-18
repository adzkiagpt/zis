/**
 * AuditLog.gs
 */

function logAudit(userId, namaUser, aksi, modul, idData, detail) {
  let sheet = getSS().getSheetByName(SHEETS.AUDIT_LOG);
  
  // Self-healing: Buat sheet jika tidak ada
  if (!sheet) {
    sheet = getSS().insertSheet(SHEETS.AUDIT_LOG);
    const headers = ['log_id', 'waktu', 'nama_user', 'user_id', 'aksi', 'modul', 'id_data', 'detail', 'ip_address'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  }

  const rowData = {
    log_id: 'LOG-' + new Date().getTime(),
    waktu: new Date(),
    nama_user: namaUser,
    user_id: userId,
    aksi: aksi,
    modul: modul,
    id_data: idData,
    detail: detail,
    ip_address: '' 
  };
  
  return appendRow(SHEETS.AUDIT_LOG, rowData);
}

function getAuditLogs() {
  const data = getAllData(SHEETS.AUDIT_LOG);
  return data.map(log => ({
    id: log.log_id,
    time: log.waktu ? Utilities.formatDate(new Date(log.waktu), "GMT+7", "yyyy-MM-dd HH:mm:ss") : '-',
    user: log.nama_user,
    userId: log.user_id,
    action: log.aksi,
    module: log.modul,
    dataId: log.id_data,
    detail: log.detail,
    ip: log.ip_address
  }));
}
