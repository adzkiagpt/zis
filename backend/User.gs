/**
 * User.gs
 */

function addUser(data, auth) {
  const rowData = {
    user_id: generateId('USR-', SHEETS.USERS),
    full_name: data.fullName,
    email: data.email,
    username: data.username,
    password: data.password,
    role: data.role,
    status: data.status || 'Aktif',
    created_at: new Date()
  };
  const result = appendRow(SHEETS.USERS, rowData);
  logAudit(auth.userId, auth.namaUser, 'CREATE', 'User', rowData.user_id, 'Menambah user baru: ' + rowData.username);
  return result;
}

function updateUser(data, auth) {
  const rowData = {
    full_name: data.fullName,
    email: data.email,
    username: data.username,
    role: data.role,
    status: data.status
  };
  const result = updateRowById(SHEETS.USERS, 'user_id', data.id, rowData);
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'User', data.id, 'Update data user: ' + data.username);
  return result;
}

function deleteUser(id, auth) {
  const result = deleteRowById(SHEETS.USERS, 'user_id', id);
  logAudit(auth.userId, auth.namaUser, 'DELETE', 'User', id, 'Menghapus user ID: ' + id);
  return result;
}

function updateUserStatus(data, auth) {
  const result = updateRowById(SHEETS.USERS, 'user_id', data.id, { status: data.status });
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'User', data.id, 'Mengubah status user ID: ' + data.id + ' menjadi ' + data.status);
  return result;
}

function resetUserPassword(data, auth) {
  // Simulasi reset password (di dunia nyata akan mengirim email/generate password baru)
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'User', data.id, 'Reset password user ID: ' + data.id);
  return true;
}
