/**
 * Utils.gs
 * Fungsi pembantu untuk manipulasi data dan response
 */

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper to check if transaction status is successful
function isSuccess(s) {
  if (!s) return false;
  const ls = String(s).trim().toLowerCase();
  return ls === 'berhasil' || ls === 'terverifikasi';
}

function getSheet(sheetName) {
  const sheet = getSS().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan!");
  return sheet;
}

function getAllData(sheetName) {
  try {
    const sheet = getSS().getSheetByName(sheetName);
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return [];
    
    const headers = values[0].map(h => String(h).trim());
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const obj = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index];
        }
      });
      data.push(obj);
    }
    return data;
  } catch (e) {
    console.warn("Gagal mengambil data dari sheet '" + sheetName + "':", e.message);
    return [];
  }
}

function appendRow(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  const lastCol = sheet.getLastColumn();
  
  if (lastCol === 0) {
    throw new Error("Sheet '" + sheetName + "' kosong atau tidak memiliki header. Silakan tambahkan header di baris pertama.");
  }
  
  // Ambil header dan bersihkan (trim)
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  
  const row = headers.map(header => {
    const value = rowData[header];
    return (value !== undefined && value !== null) ? value : '';
  });
  
  sheet.appendRow(row);
  return rowData;
}

function updateRowById(sheetName, idColumn, idValue, data) {
  const sheet = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return false;

  const headers = values[0].map(h => String(h).trim());
  const idIndex = headers.indexOf(idColumn);
  
  if (idIndex === -1) throw new Error("Kolom ID '" + idColumn + "' tidak ditemukan di sheet " + sheetName);

  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == idValue) {
      const rowNum = i + 1;
      headers.forEach((header, index) => {
        if (data[header] !== undefined && data[header] !== null) {
          sheet.getRange(rowNum, index + 1).setValue(data[header]);
        }
      });
      return true;
    }
  }
  return false;
}

function deleteRowById(sheetName, idColumn, idValue) {
  const sheet = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf(idColumn);
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == idValue) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function generateId(prefix, sheetName) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  const year = new Date().getFullYear();
  const count = (lastRow).toString().padStart(4, '0');
  return prefix + year + count;
}

/**
 * Helper to check if a date is within a specific period or range
 * @param {Date|string} date 
 * @param {string} period 'Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini', 'Custom'
 * @param {string} startDate YYYY-MM-DD
 * @param {string} endDate YYYY-MM-DD
 */
function isWithinPeriod(date, period, startDate, endDate) {
  if (!date) return false;
  const d = new Date(date);
  
  if (period === 'Custom' && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    return d >= start && d <= end;
  }

  if (!period) return true;
  const now = new Date();
  
  if (period === 'Hari Ini') {
    return d.toDateString() === now.toDateString();
  } else if (period === 'Minggu Ini') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    return d >= startOfWeek && d <= endOfWeek;
  } else if (period === 'Bulan Ini') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  } else if (period === 'Tahun Ini') {
    return d.getFullYear() === now.getFullYear();
  }
  return true; 
}
