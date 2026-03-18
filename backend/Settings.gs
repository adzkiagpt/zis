/**
 * Settings.gs
 */

function updateSettings(data, auth) {
  const sheet = getSheet(SHEETS.SETTINGS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim());
  const keyIndex = headers.indexOf('key');
  const valueIndex = headers.indexOf('value');

  if (keyIndex === -1 || valueIndex === -1) {
    throw new Error("Sheet settings tidak memiliki kolom 'key' atau 'value'");
  }

  // data adalah object { key1: value1, key2: value2, ... }
  for (const key in data) {
    const value = data[key];
    let found = false;

    for (let i = 1; i < values.length; i++) {
      if (values[i][keyIndex] === key) {
        sheet.getRange(i + 1, valueIndex + 1).setValue(value);
        found = true;
        break;
      }
    }

    if (!found) {
      sheet.appendRow([key, value]);
    }
  }

  logAudit(auth.userId, auth.namaUser, 'UPDATE', 'Settings', 'SYSTEM', 'Memperbarui pengaturan sistem');
  return true;
}
