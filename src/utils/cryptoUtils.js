const crypto = require('crypto');

/**
 * Constant-Time String Comparison (Anti Timing Attack)
 * Mencegah serangan timing side-channel saat memverifikasi token rahasia,
 * webhook signature, atau hash sensitif.
 * 
 * @param {string} a - Nilai pembanding 1
 * @param {string} b - Nilai pembanding 2
 * @returns {boolean} - true jika sama persis, false jika berbeda
 */
function safeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    // Jika panjang tidak sama, gunakan perbandingan buffer tiruan dengan panjang bufA
    // agar waktu komparasi tetap konstan dan tidak membocorkan panjang rahasia
    if (bufA.length !== bufB.length) {
        crypto.timingSafeEqual(bufA, bufA);
        return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Membuat sidik jari perangkat (Device Fingerprint) berbasis SHA-256
 * Digunakan untuk mengikat sesi ke browser/perangkat spesifik (Anti Session Hijacking)
 * 
 * @param {object} req - Express Request
 * @returns {string} - Hash SHA-256 64-karakter
 */
function generateDeviceFingerprint(req) {
    const userAgent = (req && typeof req.get === 'function') ? (req.get('user-agent') || '') : (req?.headers?.['user-agent'] || '');
    const acceptLanguage = (req && typeof req.get === 'function') ? (req.get('accept-language') || '') : (req?.headers?.['accept-language'] || '');
    
    // Gabungkan komponen browser untuk menghasilkan fingerprint unik per browser
    const rawData = `${userAgent}|${acceptLanguage}`;
    return crypto.createHash('sha256').update(rawData).digest('hex');
}

module.exports = {
    safeCompare,
    generateDeviceFingerprint
};
