const rateLimit = require('express-rate-limit');

// ==========================================
// 1. RATE LIMITERS (Anti-DDoS & Anti Brute Force)
// ==========================================

// Global: membatasi semua request dinamis per IP (static asset tidak dihitung)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat kemudian.'
    }
});

// Login & Register: mencegah brute force / credential stuffing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash('error_msg', 'Terlalu banyak percobaan. Silakan tunggu 15 menit sebelum mencoba lagi.');
        const redirectUrl = req.originalUrl.includes('register') ? '/auth/register' : '/auth/login';
        res.redirect(redirectUrl);
    }
});

// Transaksi: mencegah spam invoice & Midtrans Snap Token
const orderLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 menit
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash('error_msg', 'Batas pembuatan transaksi terlampaui. Harap tunggu beberapa saat.');
        res.redirect(req.get('Referrer') || '/');
    }
});

// API publik (cek voucher): mencegah bot menebak kode promo
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        valid: false,
        message: 'Terlalu banyak permintaan. Silakan tunggu 1 menit.'
    }
});

// Permintaan Lupa Password: mencegah spamming permintaan reset token
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // Maksimal 5 permintaan per 15 menit per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash('error_msg', 'Terlalu banyak permintaan reset password. Silakan tunggu 15 menit.');
        res.redirect('/auth/forgot-password');
    }
});

// ==========================================
// 2. SQL INJECTION DETECTOR (Defense-in-Depth)
// ------------------------------------------
// Pertahanan UTAMA tetap parameterized query (mysql2 placeholder `?`).
// Detector ini hanya lapisan tambahan untuk memblokir payload yang jelas berbahaya.
// Polanya sengaja dibuat spesifik agar tidak memblokir teks normal.
// ==========================================
const SQLI_PATTERNS = [
    /\bUNION\b[\s\S]*?\bSELECT\b/i,                                   // UNION SELECT
    /['"`]\s*(OR|AND)\s+['"`]?\w+['"`]?\s*(=|<|>|LIKE)\s*['"`]?\w+/i, // ' OR '1'='1
    /['"`]\s*(--|#|\/\*)/,                                            // '-- / '# / '/*
    /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|CREATE|EXEC)\b/i,  // stacked query
    /\b(DROP|TRUNCATE)\s+(TABLE|DATABASE)\b/i,
    /\b(SLEEP|BENCHMARK)\s*\(\s*\d/i,                                 // time-based blind
    /\bWAITFOR\s+DELAY\b/i,
    /\b(INFORMATION_SCHEMA|LOAD_FILE|INTO\s+(OUT|DUMP)FILE)\b/i
];

// Field yang tidak dipindai (password bebas berisi karakter apa pun dan selalu di-hash)
const SKIP_FIELDS = new Set(['password', 'confirmPassword', 'confirm_password', 'signature_key']);

function isSuspicious(value, depth = 0) {
    if (depth > 5 || value == null) return false;
    if (typeof value === 'string') {
        return SQLI_PATTERNS.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object') {
        return Object.entries(value).some(([key, val]) =>
            !SKIP_FIELDS.has(key) && isSuspicious(val, depth + 1)
        );
    }
    return false;
}

const sqlInjectionDetector = (req, res, next) => {
    const blocked = isSuspicious(req.query) || isSuspicious(req.body) || isSuspicious(req.params);

    if (!blocked) return next();

    console.warn(`⚠️ [Security] Pola SQL Injection diblokir | IP: ${req.ip} | ${req.method} ${req.originalUrl}`);

    if (req.xhr || (req.headers.accept || '').includes('application/json')) {
        return res.status(400).json({ error: 'Permintaan ditolak: terdeteksi pola input berbahaya.' });
    }

    return res.status(400).send(`<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>400 - Permintaan Diblokir</title></head>
<body style="background:#09090b;color:#f87171;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
    <div style="text-align:center;padding:2rem;background:#18181b;border:1px solid #ef4444;border-radius:1rem;max-width:500px;">
        <h2 style="margin-top:0;">🛑 400 Bad Request</h2>
        <p style="color:#e2e8f0;">Permintaan Anda diblokir oleh sistem keamanan ZenithPrime karena mengandung pola input yang mencurigakan.</p>
        <a href="/" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Kembali ke Beranda</a>
    </div>
</body>
</html>`);
};

// ==========================================
// 3. HELPER VALIDASI
// ==========================================
const TRANSACTION_STATUSES = ['pending', 'success', 'failed', 'expired'];
const isValidTransactionStatus = (status) => TRANSACTION_STATUSES.includes(status);

module.exports = {
    globalLimiter,
    authLimiter,
    orderLimiter,
    apiLimiter,
    passwordResetLimiter,
    sqlInjectionDetector,
    TRANSACTION_STATUSES,
    isValidTransactionStatus
};
