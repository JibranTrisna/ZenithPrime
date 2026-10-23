const rateLimit = require('express-rate-limit');
const { logSecurityEvent, SEVERITY } = require('../utils/securityLogger');

// =========================================================================
// 1. RATE LIMITERS (Anti-DDoS, Anti Brute Force, Anti Spamming)
// =========================================================================

// Global: membatasi semua request dinamis per IP (static asset tidak dihitung)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurityEvent('RATE_LIMIT_GLOBAL', `IP mencapai batas request global (300 req / 15m)`, req, SEVERITY.WARN);
        if (req.xhr || (req.headers && (req.headers.accept || '').includes('application/json'))) {
            return res.status(429).json({ error: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat kemudian.' });
        }
        res.status(429).send('Terlalu banyak permintaan dari IP Anda. Silakan coba lagi dalam 15 menit.');
    }
});

// Login & Register: mencegah brute force & credential stuffing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurityEvent('RATE_LIMIT_AUTH', `Batas percobaan auth per IP terlampaui`, req, SEVERITY.ALERT);
        req.flash('error_msg', 'Terlalu banyak percobaan dari perangkat Anda. Silakan tunggu 15 menit sebelum mencoba lagi.');
        const redirectUrl = req.originalUrl.includes('register') ? '/auth/register' : '/auth/login';
        res.redirect(redirectUrl);
    }
});

// Transaksi: mencegah spam invoice & pembuatan snap token beruntun
const orderLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 menit
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurityEvent('RATE_LIMIT_ORDER', `Batas pembuatan transaksi terlampaui`, req, SEVERITY.WARN);
        req.flash('error_msg', 'Batas pembuatan transaksi terlampaui. Harap tunggu beberapa saat.');
        res.redirect(req.get('Referrer') || '/');
    }
});

// API publik (cek voucher): mencegah bot menebak kode promo secara masif
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurityEvent('RATE_LIMIT_API', `Batas request API publik terlampaui`, req, SEVERITY.WARN);
        res.status(429).json({
            valid: false,
            message: 'Terlalu banyak permintaan. Silakan tunggu 1 menit.'
        });
    }
});

// Permintaan Lupa Password: mencegah spamming permintaan reset token
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // Maksimal 5 permintaan per 15 menit per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurityEvent('RATE_LIMIT_RESET_PASSWORD', `Spam reset password terdeteksi`, req, SEVERITY.ALERT);
        req.flash('error_msg', 'Terlalu banyak permintaan reset password. Silakan tunggu 15 menit.');
        res.redirect('/auth/forgot-password');
    }
});

// =========================================================================
// 2. ACCOUNT LOCKOUT MANAGER (Anti Brute Force per Akun)
// -------------------------------------------------------------------------
// Jika 1 akun gagal login 5 kali berturut-turut, akun dikunci selama 15 menit
// meskipun penyerang merotasi IP address.
// =========================================================================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Menit

class AccountLockoutManager {
    constructor() {
        // Map key: identifier.toLowerCase() => { count, lockedUntil, firstFailedAt }
        this.records = new Map();

        // Pembersihan otomatis memori setiap 10 menit
        setInterval(() => this.cleanup(), 10 * 60 * 1000).unref();
    }

    getKey(identifier) {
        return (identifier || '').toString().trim().toLowerCase();
    }

    /**
     * Memeriksa apakah akun sedang dalam masa lockout
     */
    isAccountLocked(identifier) {
        const key = this.getKey(identifier);
        if (!key || !this.records.has(key)) return { locked: false, remainingMinutes: 0 };

        const entry = this.records.get(key);
        if (!entry.lockedUntil) return { locked: false, remainingMinutes: 0 };

        const now = Date.now();
        if (now >= entry.lockedUntil) {
            // Masa lockout telah berakhir, reset otomatis
            this.records.delete(key);
            return { locked: false, remainingMinutes: 0 };
        }

        const remainingMs = entry.lockedUntil - now;
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        return { locked: true, remainingMinutes };
    }

    /**
     * Mencatat kegagalan login. Jika mencapai limit, akun dikunci.
     * Mengembalikan jumlah percobaan tersisa (atau 0 jika terkunci).
     */
    recordFailedAttempt(identifier, req = null) {
        const key = this.getKey(identifier);
        if (!key) return MAX_FAILED_ATTEMPTS;

        const now = Date.now();
        let entry = this.records.get(key);

        if (!entry) {
            entry = { count: 1, lockedUntil: null, firstFailedAt: now };
            this.records.set(key, entry);
            logSecurityEvent('AUTH_FAILED', `Percobaan login gagal untuk akun "${key}" (1/${MAX_FAILED_ATTEMPTS})`, req, SEVERITY.WARN);
            return MAX_FAILED_ATTEMPTS - 1;
        }

        entry.count += 1;

        if (entry.count >= MAX_FAILED_ATTEMPTS) {
            entry.lockedUntil = now + LOCKOUT_DURATION_MS;
            logSecurityEvent('ACCOUNT_LOCKED', `Akun "${key}" dikunci sementara selama 15 menit karena ${entry.count}x gagal login`, req, SEVERITY.ALERT);
            return 0;
        }

        const remaining = MAX_FAILED_ATTEMPTS - entry.count;
        logSecurityEvent('AUTH_FAILED', `Percobaan login gagal untuk akun "${key}" (${entry.count}/${MAX_FAILED_ATTEMPTS})`, req, SEVERITY.WARN);
        return remaining;
    }

    /**
     * Mengembalikan sisa percobaan sebelum akun terkunci
     */
    getRemainingAttempts(identifier) {
        const key = this.getKey(identifier);
        if (!key || !this.records.has(key)) return MAX_FAILED_ATTEMPTS;
        const entry = this.records.get(key);
        return Math.max(0, MAX_FAILED_ATTEMPTS - entry.count);
    }

    /**
     * Mereset counter saat login berhasil
     */
    resetFailedAttempts(identifier) {
        const key = this.getKey(identifier);
        if (key && this.records.has(key)) {
            this.records.delete(key);
        }
    }

    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.records.entries()) {
            // Hapus jika lockout lewat atau kegagalan pertama sudah lewat dari 30 menit
            if ((entry.lockedUntil && now > entry.lockedUntil) || (now - entry.firstFailedAt > 30 * 60 * 1000)) {
                this.records.delete(key);
            }
        }
    }
}

const accountLockoutManager = new AccountLockoutManager();

// =========================================================================
// 3. PASSWORD POLICY VALIDATOR
// -------------------------------------------------------------------------
// Standar: minimal 8 karakter, wajib kombinasi huruf dan angka
// =========================================================================
function validatePasswordStrength(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password wajib diisi.' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password minimal harus terdiri dari 8 karakter.' };
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
        return { valid: false, message: 'Password harus mengandung kombinasi huruf dan angka.' };
    }

    return { valid: true };
}

// =========================================================================
// 4. XSS INPUT SANITIZER (Cross-Site Scripting Shield)
// -------------------------------------------------------------------------
// Membersihkan script injection, dangerous HTML event handlers (onerror, onload),
// dan javascript: URI secara rekursif pada body, query, dan params.
// Field sensitif seperti password/signature diabaikan agar hash tetap akurat.
// =========================================================================
const SKIP_FIELDS = new Set(['password', 'confirmPassword', 'confirm_password', 'currentPassword', 'newPassword', 'signature_key']);

const XSS_DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<\/?(script|iframe|object|embed|style|meta|link|base|applet)\b[^>]*>/gi,
    /\bon\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, // onerror=..., onclick=..., onload=...
    /javascript\s*:\s*[^\s'"]+/gi,
    /data\s*:\s*text\/html/gi,
    /vbscript\s*:/gi
];

function sanitizeString(input, onDetect = null) {
    if (typeof input !== 'string') return input;

    let sanitized = input;
    let detected = false;

    for (const pattern of XSS_DANGEROUS_PATTERNS) {
        if (pattern.test(sanitized)) {
            detected = true;
            sanitized = sanitized.replace(pattern, '');
        }
    }

    if (detected && typeof onDetect === 'function') {
        onDetect(input);
    }

    return sanitized;
}

function sanitizeRecursive(obj, req, fieldName = '', depth = 0) {
    if (depth > 6 || obj == null) return obj;

    if (typeof obj === 'string') {
        if (SKIP_FIELDS.has(fieldName)) return obj;
        return sanitizeString(obj, (maliciousStr) => {
            logSecurityEvent('XSS_ATTEMPT', `Payload XSS terdeteksi dan dinetralisir pada field "${fieldName}": ${maliciousStr.slice(0, 80)}`, req, SEVERITY.ALERT);
        });
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeRecursive(item, req, fieldName, depth + 1));
    }

    if (typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (SKIP_FIELDS.has(key)) {
                cleaned[key] = value;
            } else {
                cleaned[key] = sanitizeRecursive(value, req, key, depth + 1);
            }
        }
        return cleaned;
    }

    return obj;
}

const xssSanitizer = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeRecursive(req.body, req);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeRecursive(req.query, req);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeRecursive(req.params, req);
    }
    next();
};

// =========================================================================
// 5. CSRF / ORIGIN VALIDATOR (Same-Origin State Verification)
// -------------------------------------------------------------------------
// Memastikan semua request pengubah status (POST, PUT, DELETE, PATCH)
// berasal dari domain aplikasi yang sama.
// Webhook Midtrans dikecualikan karena divalidasi via SHA-512 Signature Key.
// =========================================================================
const originValidator = (req, res, next) => {
    // Hanya periksa method yang mengubah state
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Pengecualian webhook Midtrans resmi (terproteksi Signature Key SHA-512)
    if (req.originalUrl.startsWith('/api/midtrans/notification')) {
        return next();
    }

    const host = req.get('host'); // e.g. "localhost:3000"
    const origin = req.get('origin');
    const referer = req.get('referer');

    // Jika origin header ada, pastikan host-nya sama dengan server host
    if (origin) {
        try {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                logSecurityEvent('CSRF_BLOCKED', `Origin asing ditolak: ${origin} (Host yang diharapkan: ${host})`, req, SEVERITY.CRITICAL);
                return res.status(403).send('Akses ditolak: Permintaan lintas domain (Cross-Origin) tidak diizinkan.');
            }
        } catch (e) {
            logSecurityEvent('CSRF_BLOCKED', `Origin header tidak valid: ${origin}`, req, SEVERITY.WARN);
            return res.status(400).send('Format header Origin tidak valid.');
        }
    } else if (referer) {
        try {
            const refererHost = new URL(referer).host;
            if (refererHost !== host) {
                logSecurityEvent('CSRF_BLOCKED', `Referer asing ditolak: ${referer} (Host yang diharapkan: ${host})`, req, SEVERITY.CRITICAL);
                return res.status(403).send('Akses ditolak: Permintaan lintas domain tidak diizinkan.');
            }
        } catch (e) {
            logSecurityEvent('CSRF_BLOCKED', `Referer header tidak valid: ${referer}`, req, SEVERITY.WARN);
            return res.status(400).send('Format header Referer tidak valid.');
        }
    }

    next();
};

// =========================================================================
// 6. SQL INJECTION DETECTOR (Defense-in-Depth)
// -------------------------------------------------------------------------
// Pertahanan UTAMA tetap parameterized query (mysql2 placeholder `?`).
// Detector ini lapisan pertahanan tambahan untuk memblokir payload berbahaya.
// =========================================================================
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

    logSecurityEvent('SQLI_ATTEMPT', `Pola SQL Injection diblokir pada request`, req, SEVERITY.CRITICAL);

    if (req.xhr || (req.headers && (req.headers.accept || '').includes('application/json'))) {
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

// =========================================================================
// 7. HELPER VALIDASI STATUS TRANSAKSI
// =========================================================================
const TRANSACTION_STATUSES = ['pending', 'success', 'failed', 'expired'];
const isValidTransactionStatus = (status) => TRANSACTION_STATUSES.includes(status);

module.exports = {
    globalLimiter,
    authLimiter,
    orderLimiter,
    apiLimiter,
    passwordResetLimiter,
    accountLockoutManager,
    validatePasswordStrength,
    xssSanitizer,
    sanitizeString,
    originValidator,
    sqlInjectionDetector,
    TRANSACTION_STATUSES,
    isValidTransactionStatus
};
