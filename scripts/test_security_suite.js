/**
 * =========================================================================
 * 🛡️ ZENITHPRIME GOOGLE-GRADE SECURITY SUITE VERIFICATION TEST
 * =========================================================================
 * Menguji seluruh 10 modul pertahanan berlapis ZenithPrime:
 * 1. Password Policy Enforcement (Kekuatan Password)
 * 2. Account Lockout Manager (Anti Brute Force & Credential Stuffing)
 * 3. XSS Input Sanitizer (Defense-in-Depth Cross-Site Scripting)
 * 4. CSRF / Origin Validator (Same-Origin State Verification)
 * 5. SQL Injection Detector (Defense-in-Depth SQLi Shield)
 * 6. Path Traversal & Null-Byte Shield (Anti LFI / RFI / Directory Traversal)
 * 7. Adaptive IP Jail (Google-Grade Fail2Ban & Automated Tarpit)
 * 8. Session Security Guard (Anti Session Hijacking via Device Fingerprint)
 * 9. Constant-Time Comparison (Anti Timing Attack)
 * 10. Security Audit Logger (Structured logging to logs/security.log)
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const {
    validatePasswordStrength,
    accountLockoutManager,
    xssSanitizer,
    originValidator,
    sqlInjectionDetector,
    pathTraversalDetector,
    ipJailManager,
    sessionSecurityGuard,
    safeCompare
} = require('../src/middlewares/securityMiddleware');
const { generateDeviceFingerprint } = require('../src/utils/cryptoUtils');
const { logSecurityEvent, logFilePath, SEVERITY } = require('../src/utils/securityLogger');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ PASS: ${testName}`);
    } else {
        console.error(`  ❌ FAIL: ${testName} - ${details}`);
    }
}

async function runSecuritySuite() {
    console.log('====================================================');
    console.log('🛡️  ZENITHPRIME GOOGLE-GRADE SECURITY VERIFICATION');
    console.log('====================================================\n');

    // ----------------------------------------------------
    // TEST 1: PASSWORD POLICY ENFORCEMENT
    // ----------------------------------------------------
    console.log('--- [1/10] Testing Password Policy Validator ---');
    assert(!validatePasswordStrength('').valid, 'Password kosong ditolak');
    assert(!validatePasswordStrength('12345').valid, 'Password kurang dari 8 karakter ditolak');
    assert(!validatePasswordStrength('alllettersnosymbols').valid, 'Password hanya huruf tanpa angka ditolak');
    assert(!validatePasswordStrength('1234567890').valid, 'Password hanya angka tanpa huruf ditolak');
    assert(validatePasswordStrength('ZenithPrime2026!').valid, 'Password kuat (huruf + angka + panjang cukup) diterima');

    // ----------------------------------------------------
    // TEST 2: ACCOUNT LOCKOUT MANAGER (Anti Brute Force)
    // ----------------------------------------------------
    console.log('\n--- [2/10] Testing Account Lockout Manager ---');
    const testEmail = 'attacker_target@zenithprime.test';

    accountLockoutManager.resetFailedAttempts(testEmail);
    assert(!accountLockoutManager.isAccountLocked(testEmail).locked, 'Akun awalnya tidak terkunci');

    for (let i = 1; i <= 4; i++) {
        accountLockoutManager.recordFailedAttempt(testEmail);
        assert(!accountLockoutManager.isAccountLocked(testEmail).locked, `Percobaan gagal ${i}: Akun belum terkunci`);
    }

    accountLockoutManager.recordFailedAttempt(testEmail);
    const lockStatus = accountLockoutManager.isAccountLocked(testEmail);
    assert(lockStatus.locked === true, 'Percobaan ke-5: Akun BERHASIL DIKUNCI');
    assert(lockStatus.remainingMinutes > 0, `Lockout aktif dengan durasi sisa: ${lockStatus.remainingMinutes} menit`);
    accountLockoutManager.resetFailedAttempts(testEmail);
    assert(!accountLockoutManager.isAccountLocked(testEmail).locked, 'Reset failed attempts berhasil membuka kunci akun');

    // ----------------------------------------------------
    // TEST 3: XSS INPUT SANITIZER
    // ----------------------------------------------------
    console.log('\n--- [3/10] Testing XSS Input Sanitizer ---');
    const mockReq = {
        body: {
            username: '<script>alert("XSS")</script>UserGanteng',
            bio: '<img src=x onerror=alert(1)>Hallo teman',
            link: 'javascript:stealCookies()',
            password: 'My<Secret>Password123'
        },
        query: {
            search: '<iframe src="evil.com"></iframe>Mobile Legends'
        },
        params: {}
    };

    let nextCalled = false;
    xssSanitizer(mockReq, {}, () => { nextCalled = true; });

    assert(nextCalled, 'Middleware xssSanitizer memanggil next()');
    assert(!mockReq.body.username.includes('<script>'), 'Script tag dibersihkan dari body');
    assert(mockReq.body.username.includes('UserGanteng'), 'Konten teks sah tetap dipertahankan');
    assert(!mockReq.body.bio.includes('onerror='), 'Event handler berbahaya (onerror) dibersihkan');
    assert(!mockReq.body.link.includes('javascript:'), 'URI berbahaya javascript: dinetralisir');
    assert(mockReq.body.password === 'My<Secret>Password123', 'Field password TIDAK diubah agar hash tetap akurat');
    assert(!mockReq.query.search.includes('<iframe'), 'Iframe dibersihkan dari query params');

    // ----------------------------------------------------
    // TEST 4: CSRF / ORIGIN VALIDATOR
    // ----------------------------------------------------
    console.log('\n--- [4/10] Testing CSRF / Origin Validator ---');
    let getPassed = false;
    originValidator({ method: 'GET', get: () => 'malicious.com' }, {}, () => { getPassed = true; });
    assert(getPassed, 'Request GET lolos tanpa batasan origin');

    let sameOriginPassed = false;
    originValidator({
        method: 'POST',
        originalUrl: '/auth/login',
        get: (h) => (h === 'host' ? 'localhost:3000' : 'http://localhost:3000')
    }, {}, () => { sameOriginPassed = true; });
    assert(sameOriginPassed, 'Request POST dengan Same-Origin diizinkan');

    let blockedCode = 0;
    originValidator({
        method: 'POST',
        originalUrl: '/auth/login',
        ip: '198.51.100.1',
        get: (h) => (h === 'host' ? 'localhost:3000' : 'http://evil-attacker-site.com')
    }, {
        status: (code) => ({
            send: () => { blockedCode = code; }
        })
    }, () => {});
    assert(blockedCode === 403, 'Request POST dari domain asing DIBLOKIR dengan HTTP 403 Forbidden');

    let webhookPassed = false;
    originValidator({
        method: 'POST',
        originalUrl: '/api/midtrans/notification',
        get: (h) => (h === 'host' ? 'localhost:3000' : 'https://api.midtrans.com')
    }, {}, () => { webhookPassed = true; });
    assert(webhookPassed, 'Webhook resmi Midtrans lolos verifikasi origin');

    // ----------------------------------------------------
    // TEST 5: SQL INJECTION DETECTOR
    // ----------------------------------------------------
    console.log('\n--- [5/10] Testing SQL Injection Detector ---');
    let normalReqPassed = false;
    sqlInjectionDetector({
        query: { game: 'mobile-legends', category: 'topup' },
        body: {},
        params: {}
    }, {}, () => { normalReqPassed = true; });
    assert(normalReqPassed, 'Input normal lolos tanpa halangan');

    let sqliBlocked = false;
    sqlInjectionDetector({
        query: { q: "1' UNION SELECT null, username, password FROM users --" },
        body: {},
        params: {},
        ip: '198.51.100.2'
    }, {
        status: (code) => ({
            send: () => { sqliBlocked = (code === 400); },
            json: () => { sqliBlocked = (code === 400); }
        })
    }, () => {});
    assert(sqliBlocked, 'Serangan SQLi "UNION SELECT" berhasil DIBLOKIR dengan HTTP 400');

    let booleanSqliBlocked = false;
    sqlInjectionDetector({
        query: {},
        body: { username: "admin' OR '1'='1" },
        params: {},
        ip: '198.51.100.3'
    }, {
        status: (code) => ({
            send: () => { booleanSqliBlocked = (code === 400); },
            json: () => { booleanSqliBlocked = (code === 400); }
        })
    }, () => {});
    assert(booleanSqliBlocked, 'Serangan SQLi boolean blind (" OR 1=1) berhasil DIBLOKIR');

    // ----------------------------------------------------
    // TEST 6: PATH TRAVERSAL & NULL-BYTE SHIELD
    // ----------------------------------------------------
    console.log('\n--- [6/10] Testing Path Traversal & Null-Byte Shield ---');
    let normalPathPassed = false;
    pathTraversalDetector({
        originalUrl: '/joki/detail/15',
        query: {},
        body: {},
        params: {}
    }, {}, () => { normalPathPassed = true; });
    assert(normalPathPassed, 'URL halaman normal lolos tanpa halangan');

    let traversalBlocked = false;
    pathTraversalDetector({
        originalUrl: '/uploads/../../etc/passwd',
        query: {},
        body: {},
        params: {},
        ip: '198.51.100.4'
    }, {
        status: (code) => ({
            send: () => { traversalBlocked = (code === 400); },
            json: () => { traversalBlocked = (code === 400); }
        })
    }, () => {});
    assert(traversalBlocked, 'Eksploitasi Path Traversal "../../etc/passwd" berhasil DIBLOKIR');

    let nullByteBlocked = false;
    pathTraversalDetector({
        originalUrl: '/avatar.png%00.php',
        query: {},
        body: {},
        params: {},
        ip: '198.51.100.5'
    }, {
        status: (code) => ({
            send: () => { nullByteBlocked = (code === 400); },
            json: () => { nullByteBlocked = (code === 400); }
        })
    }, () => {});
    assert(nullByteBlocked, 'Eksploitasi Null-Byte Injection ("%00") berhasil DIBLOKIR');

    // ----------------------------------------------------
    // TEST 7: ADAPTIVE IP JAIL (Google-Grade Fail2Ban)
    // ----------------------------------------------------
    console.log('\n--- [7/10] Testing Adaptive IP Jail (Fail2Ban & Tarpit) ---');
    const attackerIp = '203.0.113.88';
    ipJailManager.unjail(attackerIp);

    assert(!ipJailManager.isJailed(attackerIp).jailed, 'IP awalnya tidak terkarantina');

    // Poin 1 & 2: Belum masuk jail
    ipJailManager.addPenalty(attackerIp, 1, 'RATE_LIMIT_TEST');
    ipJailManager.addPenalty(attackerIp, 1, 'CSRF_SPOOF_TEST');
    assert(!ipJailManager.isJailed(attackerIp).jailed, 'Akumulasi 2 poin: IP belum di-jail');

    // Poin ke-3: MENCAPAI THRESHOLD -> MASUK JAIL 30 MENIT!
    ipJailManager.addPenalty(attackerIp, 1, 'MALICIOUS_PROBE');
    const jailStatus = ipJailManager.isJailed(attackerIp);
    assert(jailStatus.jailed === true, 'Akumulasi >=3 poin: IP BERHASIL DIKARANTINA KE JAIL');
    assert(jailStatus.remainingMinutes > 0, `Durasi karantina aktif: ${jailStatus.remainingMinutes} menit`);

    // Bebaskan manual oleh Admin
    ipJailManager.unjail(attackerIp);
    assert(!ipJailManager.isJailed(attackerIp).jailed, 'Admin berhasil membebaskan IP dari karantina');

    // ----------------------------------------------------
    // TEST 8: SESSION SECURITY GUARD (Anti-Session Hijacking)
    // ----------------------------------------------------
    console.log('\n--- [8/10] Testing Session Security Guard ---');
    const legitimateBrowser = {
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'accept-language': 'id,en-US' }
    };
    const validFingerprint = generateDeviceFingerprint(legitimateBrowser);

    // Kasus 1: Request dari browser pemilik sah
    const legitimateReq = {
        session: {
            user: { id: 1, email: 'admin@zenithprime.id', role: 'admin' },
            deviceFingerprint: validFingerprint,
            createdAt: Date.now(),
            lastActivity: Date.now()
        },
        headers: legitimateBrowser.headers,
        get: (h) => legitimateBrowser.headers[h.toLowerCase()]
    };
    let sessionValid = false;
    sessionSecurityGuard(legitimateReq, {}, () => { sessionValid = true; });
    assert(sessionValid, 'Sesi sah dengan Device Fingerprint cocok diizinkan lewat');

    // Kasus 2: Sesi dicuri & dipakai di cURL / Script Penyerang (User-Agent berubah)
    let sessionDestroyed = false;
    let redirectUrl = null;
    const stolenReq = {
        session: {
            user: { id: 1, email: 'admin@zenithprime.id', role: 'admin' },
            deviceFingerprint: validFingerprint, // Fingerprint Chrome
            createdAt: Date.now(),
            lastActivity: Date.now(),
            destroy: (cb) => { sessionDestroyed = true; cb(); }
        },
        headers: { 'user-agent': 'python-requests/2.31.0', 'accept-language': '' }, // Beda device!
        get: (h) => (h === 'user-agent' ? 'python-requests/2.31.0' : ''),
        ip: '198.51.100.99'
    };
    sessionSecurityGuard(stolenReq, {
        clearCookie: () => {},
        redirect: (url) => { redirectUrl = url; }
    }, () => {});
    assert(sessionDestroyed, 'Anti-Session Hijacking: Sesi yang dibajak langsung DIHANCURKAN (Destroyed)');
    assert(redirectUrl === '/auth/login', 'User dialihkan ke halaman login saat terdeteksi pembajakan sesi');

    // ----------------------------------------------------
    // TEST 9: CONSTANT-TIME COMPARISON (Anti-Timing Attack)
    // ----------------------------------------------------
    console.log('\n--- [9/10] Testing Constant-Time Comparison ---');
    const secretToken = 'a8f7c9e1b2d4567812345678abcdef01';
    assert(safeCompare(secretToken, secretToken), 'Token identik bernilai true');
    assert(!safeCompare(secretToken, 'a8f7c9e1b2d4567812345678abcdef02'), 'Token beda 1 karakter bernilai false');
    assert(!safeCompare(secretToken, 'short'), 'Token beda panjang bernilai false secara konstan');
    assert(!safeCompare(null, secretToken), 'Input non-string ditolak dengan aman');

    // ----------------------------------------------------
    // TEST 10: SECURITY AUDIT LOGGER
    // ----------------------------------------------------
    console.log('\n--- [10/10] Testing Security Audit Logger ---');
    logSecurityEvent('GOOGLE_SECURITY_TEST', 'Telemetry audit trail verification', null, SEVERITY.INFO);

    const logExists = fs.existsSync(logFilePath);
    assert(logExists, 'File logs/security.log tersedia');

    if (logExists) {
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        assert(logContent.includes('GOOGLE_SECURITY_TEST'), 'Entry telemetri terverifikasi tersimpan di dalam audit log');
    }

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`🏁 HASIL AUDIT GOOGLE-GRADE: ${passedTests} / ${totalTests} PENGUJIAN LULUS (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log('====================================================');

    if (passedTests === totalTests) {
        console.log('✨ Sistem Pertahanan Google-Grade ZenithPrime 100% OPERASIONAL & KOKOH!\n');
        process.exit(0);
    } else {
        console.error('⚠️ Terdapat pengujian keamanan yang gagal. Harap periksa detail di atas.');
        process.exit(1);
    }
}

runSecuritySuite().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
