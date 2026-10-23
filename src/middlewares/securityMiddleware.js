const rateLimit = require('express-rate-limit');
const { logSecurityEvent, SEVERITY } = require('../utils/securityLogger');
const { generateDeviceFingerprint, safeCompare } = require('../utils/cryptoUtils');

// =========================================================================
// 1. ADAPTIVE IP JAILING (Google-Grade Fail2Ban & Automated Tarpit)
// -------------------------------------------------------------------------
// IP penyerang yang mengumpulkan poin pelanggaran (SQLi, Path Traversal,
// CSRF Spoofing, Brute Force) akan langsung dikarantina (JAIL) selama 30 menit.
// =========================================================================
const JAIL_DURATION_MS = 30 * 60 * 1000; // 30 Menit Karantina
const MAX_PENALTY_POINTS = 3;             // 3 Poin = Langsung Masuk Jail

class IpJailManager {
    constructor() {
        // Map: ip -> { points: number, jailedUntil: timestamp | null, reason: string, firstViolationAt: number }
        this.jails = new Map();
        setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
    }

    addPenalty(ip, points, reason, req = null) {
        if (!ip) return;
        const now = Date.now();
        let record = this.jails.get(ip);
        if (!record) {
            record = { points: 0, jailedUntil: null, reason: reason, firstViolationAt: now };
            this.jails.set(ip, record);
        }

        record.points += points;
        record.reason = reason;

        if (record.points >= MAX_PENALTY_POINTS && !record.jailedUntil) {
            record.jailedUntil = now + JAIL_DURATION_MS;
            logSecurityEvent('IP_JAILED', `IP "${ip}" dikarantina ke Adaptive IP Jail selama 30 menit (${reason}, akumulasi ${record.points} poin)`, req, SEVERITY.CRITICAL);
        }
    }

    isJailed(ip) {
        if (!ip || !this.jails.has(ip)) return { jailed: false, remainingMinutes: 0 };
        const record = this.jails.get(ip);
        if (!record.jailedUntil) return { jailed: false, remainingMinutes: 0 };

        const now = Date.now();
        if (now >= record.jailedUntil) {
            this.jails.delete(ip);
            return { jailed: false, remainingMinutes: 0 };
        }

        const remainingMinutes = Math.ceil((record.jailedUntil - now) / (60 * 1000));
        return { jailed: true, remainingMinutes, reason: record.reason };
    }

    unjail(ip) {
        if (ip && this.jails.has(ip)) {
            this.jails.delete(ip);
            logSecurityEvent('IP_UNJAILED', `IP "${ip}" dibebaskan dari IP Jail oleh Administrator`, null, SEVERITY.INFO);
            return true;
        }
        return false;
    }

    getAllJailed() {
        const now = Date.now();
        const list = [];
        for (const [ip, entry] of this.jails.entries()) {
            if (entry.jailedUntil && now < entry.jailedUntil) {
                list.push({
                    ip,
                    remainingMinutes: Math.ceil((entry.jailedUntil - now) / 60000),
                    reason: entry.reason,
                    jailedUntil: new Date(entry.jailedUntil)
                });
            }
        }
        return list;
    }

    cleanup() {
        const now = Date.now();
        for (const [ip, entry] of this.jails.entries()) {
            if ((entry.jailedUntil && now > entry.jailedUntil) || (!entry.jailedUntil && (now - entry.firstViolationAt > 15 * 60 * 1000))) {
                this.jails.delete(ip);
            }
        }
    }
}

const ipJailManager = new IpJailManager();

const ipJailMiddleware = (req, res, next) => {
    const jailStatus = ipJailManager.isJailed(req.ip);
    if (!jailStatus.jailed) return next();

    logSecurityEvent('JAILED_IP_BLOCKED', `Akses dari IP terkarantina (${req.ip}) ditolak otomatis`, req, SEVERITY.ALERT);

    if (req.xhr || (req.headers && (req.headers.accept || '').includes('application/json'))) {
        return res.status(403).json({
            error: `IP Anda diblokir sementara oleh Sistem Pertahanan Otomatis ZenithPrime (${jailStatus.remainingMinutes} menit tersisa). Alasan: ${jailStatus.reason}`
        });
    }

    return res.status(403).send(`<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>403 - IP Terblokir Sementara</title></head>
<body style="background:#09090b;color:#f87171;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
    <div style="text-align:center;padding:2.5rem;background:#18181b;border:1px solid #ef4444;border-radius:1rem;max-width:550px;box-shadow:0 10px 30px rgba(239,68,68,0.2);">
        <h2 style="margin-top:0;font-size:1.6rem;">🛡️ Akses Dibatasi (Adaptive Threat Defense)</h2>
        <p style="color:#e2e8f0;line-height:1.6;">IP Anda (<strong>${req.ip}</strong>) telah dikarantina sementara selama <strong>${jailStatus.remainingMinutes} menit</strong> karena terdeteksi melakukan aktivitas mencurigakan berulang (<em>${jailStatus.reason}</em>).</p>
        <p style="color:#94a3b8;font-size:0.9rem;">Sistem ini beroperasi otomatis sesuai standar keamanan Google / Zero-Trust untuk melindungi server.</p>
    </div>
</body>
</html>`);
};

// =========================================================================
// 2. PATH TRAVERSAL & NULL-BYTE SHIELD
// -------------------------------------------------------------------------
// Menangkal eksploitasi direktori lokal (LFI/RFI/Null Byte Injection)
// seperti ../, ..\\, %2e%2e, %00, dsb.
// =========================================================================
const PATH_TRAVERSAL_REGEX = /(\.\.[\/\\]|%2e%2e[\/\\]|%2e%2e%2f|%2e%2e%5c|\.\.%2f|\.\.%5c|%252e%252e|%00|\\0)/i;

function hasPathTraversal(obj, depth = 0) {
    if (depth > 5 || obj == null) return false;
    if (typeof obj === 'string') {
        return PATH_TRAVERSAL_REGEX.test(obj);
    }
    if (typeof obj === 'object') {
        return Object.values(obj).some(val => hasPathTraversal(val, depth + 1));
    }
    return false;
}

const pathTraversalDetector = (req, res, next) => {
    const rawUrl = req.originalUrl || req.url || '';
    const isMalicious = PATH_TRAVERSAL_REGEX.test(rawUrl) || hasPathTraversal(req.query) || hasPathTraversal(req.body) || hasPathTraversal(req.params);

    if (!isMalicious) return next();

    ipJailManager.addPenalty(req.ip, 3, 'PATH_TRAVERSAL_EXPLOIT', req);
    logSecurityEvent('PATH_TRAVERSAL_BLOCKED', `Upaya Path Traversal / LFI diblokir pada URL: ${rawUrl}`, req, SEVERITY.CRITICAL);

    if (req.xhr || (req.headers && (req.headers.accept || '').includes('application/json'))) {
        return res.status(400).json({ error: 'Permintaan ditolak: terdeteksi pola direktori traversal ilegal.' });
    }

    return res.status(400).send('Permintaan Ditolak: Path Traversal terdeteksi.');
};

// =========================================================================
// 3. GOOGLE RISK-BASED SESSION GUARD (Anti Session Hijacking & Fixation)
// -------------------------------------------------------------------------
// - Mengikat sesi ke Fingerprint Perangkat (SHA-256)
// - Membatasi ketidakaktifan (Inactivity Timeout 2 Jam)
// - Membatasi total masa aktif sesi (Absolute Lifetime 24 Jam)
// =========================================================================
const SESSION_INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 Jam tidak aktif -> logout
const SESSION_ABSOLUTE_LIMIT = 24 * 60 * 60 * 1000;  // 24 Jam masa sesi absolut

const sessionSecurityGuard = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }

    const currentFingerprint = generateDeviceFingerprint(req);
    const sessionFingerprint = req.session.deviceFingerprint;

    // 1. Validasi Sidik Jari Perangkat (Anti Session Hijacking)
    if (sessionFingerprint && currentFingerprint !== sessionFingerprint) {
        logSecurityEvent('SESSION_HIJACK_ATTEMPT', `Upaya pembajakan sesi terdeteksi! Device Fingerprint berubah untuk User ${req.session.user.id} (${req.session.user.email})`, req, SEVERITY.CRITICAL);
        ipJailManager.addPenalty(req.ip, 3, 'SESSION_HIJACKING_ATTEMPT', req);

        req.session.destroy(() => {
            res.clearCookie('zp_sid');
            if (req.xhr || (req.headers && (req.headers.accept || '').includes('application/json'))) {
                return res.status(401).json({ error: 'Sesi dibatalkan demi keamanan karena terdeteksi perubahan perangkat (Anti-Session Hijacking).' });
            }
            return res.redirect('/auth/login');
        });
        return;
    }

    const now = Date.now();

    // 2. Inactivity Timeout (2 Jam)
    if (req.session.lastActivity && (now - req.session.lastActivity > SESSION_INACTIVITY_LIMIT)) {
        logSecurityEvent('SESSION_EXPIRED_INACTIVITY', `Sesi kedaluwarsa karena tidak aktif: User ${req.session.user.id}`, req, SEVERITY.INFO);
        req.session.destroy(() => {
            res.clearCookie('zp_sid');
            return res.redirect('/auth/login');
        });
        return;
    }

    // 3. Absolute Session Lifetime (24 Jam)
    if (req.session.createdAt && (now - req.session.createdAt > SESSION_ABSOLUTE_LIMIT)) {
        logSecurityEvent('SESSION_EXPIRED_LIFETIME', `Sesi mencapai batas waktu absolut 24 jam: User ${req.session.user.id}`, req, SEVERITY.INFO);
        req.session.destroy(() => {
            res.clearCookie('zp_sid');
            return res.redirect('/auth/login');
        });
        return;
    }

    // Perbarui timestamp aktivitas terakhir
    req.session.lastActivity = now;
    next();
};

// =========================================================================
// 4. RATE LIMITERS (Anti-DDoS, Anti Brute Force, Anti Spamming)
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
        ipJailManager.addPenalty(req.ip, 1, 'AUTH_RATE_LIMIT_HIT', req);
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
        ipJailManager.addPenalty(req.ip, 1, 'RESET_PASSWORD_SPAM', req);
        logSecurityEvent('RATE_LIMIT_RESET_PASSWORD', `Spam reset password terdeteksi`, req, SEVERITY.ALERT);
        req.flash('error_msg', 'Terlalu banyak permintaan reset password. Silakan tunggu 15 menit.');
        res.redirect('/auth/forgot-password');
    }
});

// =========================================================================
// 5. ACCOUNT LOCKOUT MANAGER (Anti Brute Force per Akun)
// =========================================================================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Menit

class AccountLockoutManager {
    constructor() {
        this.records = new Map();
        setInterval(() => this.cleanup(), 10 * 60 * 1000).unref();
    }

    getKey(identifier) {
        return (identifier || '').toString().trim().toLowerCase();
    }

    isAccountLocked(identifier) {
        const key = this.getKey(identifier);
        if (!key || !this.records.has(key)) return { locked: false, remainingMinutes: 0 };

        const entry = this.records.get(key);
        if (!entry.lockedUntil) return { locked: false, remainingMinutes: 0 };

        const now = Date.now();
        if (now >= entry.lockedUntil) {
            this.records.delete(key);
            return { locked: false, remainingMinutes: 0 };
        }

        const remainingMs = entry.lockedUntil - now;
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        return { locked: true, remainingMinutes };
    }

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
            if (req && req.ip) {
                ipJailManager.addPenalty(req.ip, 2, 'BRUTE_FORCE_ACCOUNT_LOCKOUT', req);
            }
            logSecurityEvent('ACCOUNT_LOCKED', `Akun "${key}" dikunci sementara selama 15 menit karena ${entry.count}x gagal login`, req, SEVERITY.ALERT);
            return 0;
        }

        const remaining = MAX_FAILED_ATTEMPTS - entry.count;
        logSecurityEvent('AUTH_FAILED', `Percobaan login gagal untuk akun "${key}" (${entry.count}/${MAX_FAILED_ATTEMPTS})`, req, SEVERITY.WARN);
        return remaining;
    }

    getRemainingAttempts(identifier) {
        const key = this.getKey(identifier);
        if (!key || !this.records.has(key)) return MAX_FAILED_ATTEMPTS;
        const entry = this.records.get(key);
        return Math.max(0, MAX_FAILED_ATTEMPTS - entry.count);
    }

    resetFailedAttempts(identifier) {
        const key = this.getKey(identifier);
        if (key && this.records.has(key)) {
            this.records.delete(key);
        }
    }

    unlock(identifier) {
        this.resetFailedAttempts(identifier);
        logSecurityEvent('ACCOUNT_UNLOCKED', `Akun "${identifier}" dibuka kuncinya oleh Administrator`, null, SEVERITY.INFO);
    }

    getAllLocked() {
        const locked = [];
        const now = Date.now();
        for (const [key, entry] of this.records.entries()) {
            if (entry.lockedUntil && now < entry.lockedUntil) {
                locked.push({
                    identifier: key,
                    remainingMinutes: Math.ceil((entry.lockedUntil - now) / 60000),
                    lockedUntil: new Date(entry.lockedUntil)
                });
            }
        }
        return locked;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.records.entries()) {
            if ((entry.lockedUntil && now > entry.lockedUntil) || (now - entry.firstFailedAt > 30 * 60 * 1000)) {
                this.records.delete(key);
            }
        }
    }
}

const accountLockoutManager = new AccountLockoutManager();

// =========================================================================
// 6. PASSWORD POLICY VALIDATOR
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
// 7. XSS INPUT SANITIZER
// =========================================================================
const SKIP_FIELDS = new Set(['password', 'confirmPassword', 'confirm_password', 'currentPassword', 'newPassword', 'signature_key']);

const XSS_DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<\/?(script|iframe|object|embed|style|meta|link|base|applet)\b[^>]*>/gi,
    /\bon\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi,
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
            logSecurityEvent('XSS_ATTEMPT', `Payload XSS dinetralisir pada field "${fieldName}": ${maliciousStr.slice(0, 80)}`, req, SEVERITY.ALERT);
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
// 8. CSRF / ORIGIN VALIDATOR
// =========================================================================
const originValidator = (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    if (req.originalUrl.startsWith('/api/midtrans/notification')) {
        return next();
    }

    const host = req.get('host');
    const origin = req.get('origin');
    const referer = req.get('referer');

    if (origin) {
        try {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                ipJailManager.addPenalty(req.ip, 2, 'CSRF_ORIGIN_SPOOF', req);
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
                ipJailManager.addPenalty(req.ip, 2, 'CSRF_REFERER_SPOOF', req);
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
// 9. SQL INJECTION DETECTOR
// =========================================================================
const SQLI_PATTERNS = [
    /\bUNION\b[\s\S]*?\bSELECT\b/i,
    /['"`]\s*(OR|AND)\s+['"`]?\w+['"`]?\s*(=|<|>|LIKE)\s*['"`]?\w+/i,
    /['"`]\s*(--|#|\/\*)/,
    /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|CREATE|EXEC)\b/i,
    /\b(DROP|TRUNCATE)\s+(TABLE|DATABASE)\b/i,
    /\b(SLEEP|BENCHMARK)\s*\(\s*\d/i,
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

    // Serangan SQLi adalah pelanggaran berat -> 3 poin (Langsung Masuk Jail!)
    ipJailManager.addPenalty(req.ip, 3, 'SQL_INJECTION_ATTEMPT', req);
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
// 10. HELPER VALIDASI STATUS TRANSAKSI
// =========================================================================
const TRANSACTION_STATUSES = ['pending', 'success', 'failed', 'expired'];
const isValidTransactionStatus = (status) => TRANSACTION_STATUSES.includes(status);

module.exports = {
    ipJailManager,
    ipJailMiddleware,
    pathTraversalDetector,
    sessionSecurityGuard,
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
    isValidTransactionStatus,
    safeCompare
};
