/**
 * Program.gs
 */

function addProgram(data, auth) {
  if (!data) throw new Error("Data program tidak ditemukan!");
  
  const program_id = generateId('PRG-', SHEETS.PROGRAM);
  const nama_program = data.nama_program || data.name || '';
  const kategori = data.kategori || data.category || 'Pendidikan';
  const jenis_dana = data.jenis_dana || data.fundType || 'Zakat';
  const target_dana = Number(data.target_dana || data.target || 0);
  const pic = data.pic || '-';
  const tgl_mulai = data.tgl_mulai || data.start || '';
  const tgl_selesai = data.tgl_selesai || data.end || '';
  const deskripsi = data.deskripsi || data.desc || '';
  const status = data.status || 'Aktif';

  const programData = {
    program_id: program_id,
    nama_program: nama_program,
    kategori: kategori,
    jenis_dana: jenis_dana,
    target_dana: target_dana,
    status: status,
    pic: pic,
    tgl_mulai: tgl_mulai,
    tgl_selesai: tgl_selesai,
    deskripsi: deskripsi,
    collected: 0,
    created_at: new Date()
  };
  
  const result = appendRow(SHEETS.PROGRAM, programData);
  logAudit(auth.userId, auth.namaUser, 'CREATE', 'Program', program_id, 'Menambah program: ' + nama_program);
  return result;
}

function updateProgram(data, auth) {
  if (!data) throw new Error("Data program tidak ditemukan!");
  const id = data.program_id || data.id;
  if (!id) throw new Error("ID Program wajib disertakan!");
  
  const programData = {
    program_id: id,
    nama_program: data.nama_program || data.name || '',
    kategori: data.kategori || data.category || '',
    jenis_dana: data.jenis_dana || data.fundType || '',
    target_dana: Number(data.target_dana || data.target || 0),
    pic: data.pic || '-',
    tgl_mulai: data.tgl_mulai || data.start || '',
    tgl_selesai: data.tgl_selesai || data.end || '',
    deskripsi: data.deskripsi || data.desc || '',
    status: data.status || 'Aktif'
  };

  const result = updateRowById(SHEETS.PROGRAM, 'program_id', id, programData);
  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Program', id, 'Mengubah data program: ' + (programData.nama_program));
  return result;
}

function deleteProgram(id, auth) {
  const result = deleteRowById(SHEETS.PROGRAM, 'program_id', id);
  logAudit(auth.userId, auth.namaUser, 'DELETE', 'Program', id, 'Menghapus program ID: ' + id);
  return result;
}
