/**
 * Donatur.gs
 */

function addDonatur(data, auth) {
  data.donatur_id = generateId('DON-', SHEETS.DONATUR);
  data.created_at = new Date();
  const result = appendRow(SHEETS.DONATUR, data);
  logAudit(auth.userId, auth.namaUser, 'CREATE', 'Donatur', data.donatur_id, 'Menambah donatur: ' + data.nama_lengkap);
  return result;
}

function updateDonatur(data, auth) {
  const result = updateRowById(SHEETS.DONATUR, 'donatur_id', data.donatur_id, data);
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Donatur', data.donatur_id, 'Mengubah data donatur: ' + data.nama_lengkap);
  return result;
}

function deleteDonatur(id, auth) {
  const result = deleteRowById(SHEETS.DONATUR, 'donatur_id', id);
  logAudit(auth.userId, auth.namaUser, 'DELETE', 'Donatur', id, 'Menghapus donatur ID: ' + id);
  return result;
}
