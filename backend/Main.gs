/**
 * Main.gs
 * Entry point untuk API
 */

function getDashboardData(params) {
  const period = params ? params.period : 'Bulan Ini';
  const startDate = params ? params.startDate : null;
  const endDate = params ? params.endDate : null;
  
  const masuk = getAllData(SHEETS.TRANSAKSI_MASUK);
  const keluar = getAllData(SHEETS.TRANSAKSI_KELUAR);
  const donatur = getAllData(SHEETS.DONATUR);
  const mustahik = getAllData(SHEETS.MUSTAHIK);
  const program = getAllData(SHEETS.PROGRAM);
  
  // Overall totals for balance
  const overallIn = masuk.filter(m => isSuccess(m.status)).reduce((sum, m) => sum + Number(m.nominal || 0), 0);
  const overallOut = keluar.filter(k => isSuccess(k.status)).reduce((sum, k) => sum + Number(k.nominal || 0), 0);

  // Period totals
  const periodIn = masuk.filter(m => isWithinPeriod(m.tanggal, period, startDate, endDate) && isSuccess(m.status)).reduce((sum, m) => sum + Number(m.nominal || 0), 0);
  const periodOut = keluar.filter(k => isWithinPeriod(k.tanggal, period, startDate, endDate) && isSuccess(k.status)).reduce((sum, k) => sum + Number(k.nominal || 0), 0);
  
  return {
    stats: {
      totalBalance: overallIn - overallOut,
      totalIn: periodIn,
      totalOut: periodOut,
      donors: donatur.length,
      mustahik: mustahik.length,
      programs: program.length
    },
    recentIn: masuk.slice(-5).reverse().map(m => ({
      date: m.tanggal ? Utilities.formatDate(new Date(m.tanggal), "GMT+7", "dd/MM/yy") : '-',
      name: m.nama_donatur,
      amount: m.nominal,
      status: m.status
    })),
    recentOut: keluar.slice(-5).reverse().map(k => ({
      date: k.tanggal ? Utilities.formatDate(new Date(k.tanggal), "GMT+7", "dd/MM/yy") : '-',
      program: k.nama_program,
      amount: k.nominal,
      status: k.status
    })),
    activePrograms: program.filter(p => p.status === 'Aktif').slice(0, 3).map(p => {
      const pId = String(p.program_id || '').trim();
      const pIn = masuk.filter(m => String(m.program_id || '').trim() === pId && isSuccess(m.status)).reduce((sum, m) => sum + Number(m.nominal || 0), 0);
      
      return {
        name: p.nama_program,
        category: p.kategori,
        progress: Math.round((pIn / (p.target_dana || 1)) * 100),
        collected: pIn
      };
    }),
    chartData: getChartData(masuk, keluar)
  };
}

function getChartData(masuk, keluar) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const now = new Date();
  const labels = [];
  const inData = [];
  const outData = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    
    labels.push(months[m]);
    
    const mIn = masuk.filter(trx => {
      const t = new Date(trx.tanggal);
      return t.getMonth() === m && t.getFullYear() === y && isSuccess(trx.status);
    }).reduce((sum, trx) => sum + Number(trx.nominal || 0), 0);
    
    const mOut = keluar.filter(trx => {
      const t = new Date(trx.tanggal);
      return t.getMonth() === m && t.getFullYear() === y && isSuccess(trx.status);
    }).reduce((sum, trx) => sum + Number(trx.nominal || 0), 0);
    
    inData.push(mIn / 1000000); // In millions for chart readability
    outData.push(mOut / 1000000);
  }
  
  return {
    labels: labels,
    in: inData,
    out: outData
  };
}

function getInitialData() {
  const settingsArr = getAllData(SHEETS.SETTINGS);
  const settingsObj = {};
  settingsArr.forEach(item => {
    if (item.key) settingsObj[item.key] = item.value;
  });

  return {
    donatur: getDonatur(),
    mustahik: getMustahik(),
    program: getProgram(),
    settings: settingsObj,
    balance: getSaldoDana(),
    users: getUsers()
  };
}

function getDonatur() {
  const donatur = getAllData(SHEETS.DONATUR);
  const masuk = getAllData(SHEETS.TRANSAKSI_MASUK);
  
  return donatur.map(d => {
    const dId = String(d.donatur_id || '').trim();
    const totalDonasi = masuk
      .filter(m => String(m.donatur_id || '').trim() === dId && isSuccess(m.status))
      .reduce((sum, m) => sum + Number(m.nominal || 0), 0);
    return {
      ...d,
      total_donasi: totalDonasi
    };
  });
}

function getMustahik() {
  return getAllData(SHEETS.MUSTAHIK);
}

function getProgram() {
  const program = getAllData(SHEETS.PROGRAM);
  const masuk = getAllData(SHEETS.TRANSAKSI_MASUK);
  const keluar = getAllData(SHEETS.TRANSAKSI_KELUAR);
  
  return program.map(p => {
    const pId = String(p.program_id || '').trim();
    const pIn = masuk.filter(m => String(m.program_id || '').trim() === pId && isSuccess(m.status)).reduce((sum, m) => sum + Number(m.nominal || 0), 0);
    const pOut = keluar.filter(k => String(k.program_id || '').trim() === pId && isSuccess(k.status)).reduce((sum, k) => sum + Number(k.nominal || 0), 0);
    return {
      ...p,
      collected: pIn,
      disbursed: pOut,
      balance: pIn - pOut
    };
  });
}

function getTransaksiMasuk() {
  return getAllData(SHEETS.TRANSAKSI_MASUK);
}

function getTransaksiKeluar() {
  return getAllData(SHEETS.TRANSAKSI_KELUAR);
}

function getUsers() {
  const data = getAllData(SHEETS.USERS);
  return data.map(u => ({
    id: u.user_id,
    fullName: u.full_name,
    email: u.email,
    username: u.username,
    role: u.role,
    status: u.status,
    lastLogin: u.created_at ? Utilities.formatDate(new Date(u.created_at), "GMT+7", "yyyy-MM-dd HH:mm:ss") : '-'
  }));
}

function getSaldoDana() {
  const masuk = getAllData(SHEETS.TRANSAKSI_MASUK);
  const keluar = getAllData(SHEETS.TRANSAKSI_KELUAR);
  const jenisDana = getAllData(SHEETS.JENIS_DANA);
  
  // Normalize fund type helper
  const normalizeFund = (f) => {
    if (!f) return '';
    let nf = String(f).trim();
    // Handle common variations to ensure balance is captured correctly
    if (nf.toLowerCase() === 'sadaqah' || nf.toLowerCase() === 'shadaqah' || nf.toLowerCase() === 'sedekah') return 'Shadaqah';
    return nf;
  };

  return jenisDana.map(jd => {
    const targetFund = normalizeFund(jd.nama_dana);
    const totalIn = masuk.filter(m => normalizeFund(m.fund_type) === targetFund && isSuccess(m.status)).reduce((sum, m) => sum + Number(m.nominal || 0), 0);
    const totalOut = keluar.filter(k => normalizeFund(k.fund_type) === targetFund && isSuccess(k.status)).reduce((sum, k) => sum + Number(k.nominal || 0), 0);
    return {
      fund: String(jd.nama_dana || '').trim(),
      totalIn: totalIn,
      totalOut: totalOut,
      balance: totalIn - totalOut
    };
  });
}

function getReportData() {
  try {
    const masuk = getAllData(SHEETS.TRANSAKSI_MASUK);
    const keluar = getAllData(SHEETS.TRANSAKSI_KELUAR);
    const donatur = getAllData(SHEETS.DONATUR);
    const mustahik = getAllData(SHEETS.MUSTAHIK);
    const program = getAllData(SHEETS.PROGRAM);
    const saldo = getSaldoDana();

    // Map for easy lookup
    const programMap = {};
    program.forEach(p => programMap[p.program_id] = p.nama_program);

    const mustahikMap = {};
    const mustahikNameMap = {};
    mustahik.forEach(m => {
      mustahikMap[m.mustahik_id] = m.asnaf;
      mustahikNameMap[m.nama_lengkap] = m.asnaf;
    });

    return {
      penerimaan: masuk.map(m => ({
        date: m.tanggal,
        donatur_id: m.donatur_id,
        name: m.nama_donatur,
        fund: m.fund_type,
        program: programMap[m.program_id] || '-',
        amount: Number(m.nominal || 0),
        status: m.status
      })),
      penyaluran: keluar.map(k => ({
        date: k.tanggal,
        mustahik_id: k.mustahik_id || '',
        name: k.receiver_name,
        asnaf: mustahikMap[k.mustahik_id] || mustahikNameMap[k.receiver_name] || '-',
        fund: k.fund_type,
        amount: Number(k.nominal || 0),
        status: k.status
      })),
      saldo: saldo,
      donatur: donatur.map(d => {
        const dId = String(d.donatur_id || '').trim();
        const totalDonasi = masuk
          .filter(m => String(m.donatur_id || '').trim() === dId && isSuccess(m.status))
          .reduce((sum, m) => sum + Number(m.nominal || 0), 0);
        return {
          ...d,
          total_donasi: totalDonasi
        };
      }),
      mustahik: mustahik,
      program: program.map(p => {
        const pId = String(p.program_id || '').trim();
        const realIn = masuk.filter(m => String(m.program_id || '').trim() === pId && isSuccess(m.status)).reduce((sum, m) => sum + Number(m.nominal || 0), 0);
        const realOut = keluar.filter(k => String(k.program_id || '').trim() === pId && isSuccess(k.status)).reduce((sum, k) => sum + Number(k.nominal || 0), 0);
        const target = Number(p.target_dana || 0);
        return {
          name: p.nama_program,
          target: target,
          in: realIn,
          out: realOut,
          progress: target > 0 ? Math.min(100, Math.round((realIn / target) * 100)) : 0
        };
      })
    };
  } catch (e) {
    console.error("Gagal mengambil data laporan:", e.toString());
    throw new Error("Gagal mengambil data laporan: " + e.message);
  }
}

function getLaporanPenerimaan(filter) {
  let data = getAllData(SHEETS.TRANSAKSI_MASUK);
  return data;
}

function getLaporanPenyaluran(filter) {
  let data = getAllData(SHEETS.TRANSAKSI_KELUAR);
  return data;
}

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getDashboard':
      case 'getDashboardData': return jsonResponse(getDashboardData(e.parameter));
      case 'getDonatur': return jsonResponse(getDonatur());
      case 'getMustahik': return jsonResponse(getMustahik());
      case 'getProgram': return jsonResponse(getProgram());
      case 'getTransaksiMasuk':
      case 'getTrxMasuk': return jsonResponse(getTransaksiMasuk());
      case 'getTransaksiKeluar':
      case 'getTrxKeluar': return jsonResponse(getTransaksiKeluar());
      case 'getSaldoDana':
      case 'getBalance': return jsonResponse(getSaldoDana());
      case 'getInitialData': return jsonResponse(getInitialData());
      case 'getUsers': return jsonResponse(getUsers());
      case 'getAuditLogs': return jsonResponse(getAuditLogs());
      case 'getSettings': return jsonResponse(getAllData(SHEETS.SETTINGS));
      case 'getLaporanPenerimaan': return jsonResponse(getLaporanPenerimaan(e.parameter));
      case 'getLaporanPenyaluran': return jsonResponse(getLaporanPenyaluran(e.parameter));
      case 'getReportData': return jsonResponse(getReportData());
      case 'setup': return jsonResponse({ message: setupSpreadsheet() });
      default: return jsonResponse({ error: 'Get action not found' });
    }
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (f) {
    return jsonResponse({ error: 'Format JSON tidak valid' });
  }

  const action = body.action;
  const data = body.data;
  const auth = body.auth || { userId: 'SYSTEM', namaUser: 'System' };
  
  try {
    let result;
    switch (action) {
      case 'addDonatur': result = addDonatur(data, auth); break;
      case 'updateDonatur': result = updateDonatur(data, auth); break;
      case 'deleteDonatur': result = deleteDonatur(data.id, auth); break;
      
      case 'addMustahik': result = addMustahik(data, auth); break;
      case 'updateMustahik': result = updateMustahik(data, auth); break;
      case 'updateMustahikStatus': result = updateMustahikStatus(data, auth); break;
      case 'deleteMustahik': result = deleteMustahik(data.id, auth); break;
      
      case 'addProgram': result = addProgram(data, auth); break;
      case 'updateProgram': result = updateProgram(data, auth); break;
      case 'deleteProgram': result = deleteProgram(data.id, auth); break;
      
      case 'addTransaksiMasuk': 
      case 'addTrxMasuk': result = addTransaksiMasuk(data, auth); break;
      case 'updateTransaksiMasuk': 
      case 'updateTrxMasuk': result = updateTransaksiMasuk(data, auth); break;
      case 'updateTrxMasukStatus': result = updateTrxMasukStatus(data, auth); break;
      case 'deleteTransaksiMasuk': 
      case 'deleteTrxMasuk': result = deleteTransaksiMasuk(data.id, auth); break;
      
      case 'addTransaksiKeluar': 
      case 'addTrxKeluar': result = addTransaksiKeluar(data, auth); break;
      case 'updateTransaksiKeluar': 
      case 'updateTrxKeluar': result = updateTransaksiKeluar(data, auth); break;
      case 'deleteTransaksiKeluar': 
      case 'deleteTrxKeluar': result = deleteTransaksiKeluar(data.id, auth); break;
      
      case 'addUser': result = addUser(data, auth); break;
      case 'updateUser': result = updateUser(data, auth); break;
      case 'updateUserStatus': result = updateUserStatus(data, auth); break;
      case 'resetUserPassword': result = resetUserPassword(data, auth); break;
      case 'deleteUser': result = deleteUser(data.id, auth); break;
      
      case 'updateSettings': result = updateSettings(data, auth); break;
      
      case 'getDashboardData': result = getDashboardData(); break;
      case 'getReportData': result = getReportData(); break;
      
      default: return jsonResponse({ error: 'Post action not found' });
    }
    return jsonResponse({ success: true, data: result });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}
