/**
 * Mustahik.gs
 */

function addMustahik(data, auth) {
  data.mustahik_id = generateId('MUS-', SHEETS.MUSTAHIK);
  data.created_at = new Date();
  const result = appendRow(SHEETS.MUSTAHIK, data);
  logAudit(auth.userId, auth.namaUser, 'CREATE', 'Mustahik', data.mustahik_id, 'Menambah mustahik: ' + data.nama_lengkap);
  return result;
}

function updateMustahik(data, auth) {
  const id = data.mustahik_id || data.id;
  const result = updateRowById(SHEETS.MUSTAHIK, 'mustahik_id', id, data);
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Mustahik', id, 'Mengubah data mustahik: ' + (data.nama_lengkap || data.name));
  return result;
}

function deleteMustahik(id, auth) {
  const result = deleteRowById(SHEETS.MUSTAHIK, 'mustahik_id', id);
  logAudit(auth.userId, auth.namaUser, 'DELETE', 'Mustahik', id, 'Menghapus mustahik ID: ' + id);
  return result;
}

function updateMustahikStatus(data, auth) {
  const result = updateRowById(SHEETS.MUSTAHIK, 'mustahik_id', data.id, { status: data.status, note: data.note });
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Mustahik', data.id, 'Verifikasi mustahik ID: ' + data.id + ' menjadi ' + data.status);
  return result;
}
