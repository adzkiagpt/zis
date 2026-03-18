/**
 * gasService.ts
 * Service untuk menangani komunikasi antara Frontend (React) dan Backend (Google Apps Script).
 */

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

export interface GasRequest {
  action: string;
  payload?: any;
  user?: string;
}

export const callGas = async (request: GasRequest) => {
  try {
    // Catatan: Dalam lingkungan pengembangan, ini mungkin akan gagal karena CORS 
    // kecuali Apps Script sudah dikonfigurasi dengan benar.
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script sering membutuhkan no-cors untuk redirect
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // Karena no-cors, kita tidak bisa membaca response secara langsung.
    // Dalam produksi, gunakan library seperti 'google-apps-script-run-proxy' 
    // atau konfigurasi CORS yang tepat di sisi Apps Script.
    return { success: true, message: 'Request sent to GAS' };
  } catch (error) {
    console.error('GAS Service Error:', error);
    throw error;
  }
};

/**
 * Contoh fungsi-fungsi spesifik
 */
export const getDonatur = () => callGas({ action: 'getDonatur' });
export const addDonatur = (data: any) => callGas({ action: 'addDonatur', payload: data });
export const getDashboardStats = () => callGas({ action: 'getDashboardStats' });
