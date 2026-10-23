/**
 * =========================================================================
 * 🛡️ ZENITHPRIME SECURITY SUITE VERIFICATION TEST
 * =========================================================================
 * Menguji seluruh modul pertahanan berlapis ZenithPrime:
 * 1. Password Policy Enforcement (Kekuatan Password)
 * 2. Account Lockout Manager (Anti Brute Force & Credential Stuffing)
 * 3. XSS Input Sanitizer (Defense-in-Depth Cross-Site Scripting)
 * 4. CSRF / Origin Validator (Same-Origin State Verification)
 * 5. SQL Injection Detector (Defense-in-Depth SQLi Shield)
 * 6. Security Audit Logger (Structured logging to logs/security.log)
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const {
    validatePasswordStrength,
    accountLockoutManager,
    xssSanitizer,
    originValidator,
    sqlInjectionDetector
} = require('../src/middlewares/securityMiddleware');
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
    console.log('🛡️  ZENITHPRIME SECURITY AUDIT & VERIFICATION SUITE');
    console.log('====================================================\n');

    // ----------------------------------------------------
    // TEST 1: PASSWORD POLICY ENFORCEMENT
    // ----------------------------------------------------
    console.log('--- [1/6] Testing Password Policy Validator ---');
    const p1 = validatePasswordStrength('');
    assert(!p1.valid, 'Password kosong ditolak');

    const p2 = validatePasswordStrength('12345');
    assert(!p2.valid, 'Password kurang dari 8 karakter ditolak');

    const p3 = validatePasswordStrength('alllettersnosymbols');
    assert(!p3.valid, 'Password hanya huruf tanpa angka ditolak');

    const p4 = validatePasswordStrength('1234567890');
    assert(!p4.valid, 'Password hanya angka tanpa huruf ditolak');

    const p5 = validatePasswordStrength('ZenithPrime2026!');
    assert(p5.valid, 'Password kuat (huruf + angka + panjang cukup) diterima');

    // ----------------------------------------------------
    // TEST 2: ACCOUNT LOCKOUT MANAGER (Anti Brute Force)
    // ----------------------------------------------------
    console.log('\n--- [2/6] Testing Account Lockout Manager ---');
    const testEmail = 'attacker_target@zenithprime.test';

    accountLockoutManager.resetFailedAttempts(testEmail);
    assert(!accountLockoutManager.isAccountLocked(testEmail).locked, 'Akun awalnya tidak terkunci');

    // Simulasi 4x gagal berturut-turut
    for (let i = 1; i <= 4; i++) {
        const rem = accountLockoutManager.recordFailedAttempt(testEmail);
        assert(!accountLockoutManager.isAccountLocked(testEmail).locked, `Percobaan gagal ${i}: Akun belum terkunci`);
    }

    // Percobaan ke-5 -> Harus terkunci!
    const rem5 = accountLockoutManager.recordFailedAttempt(testEmail);
    const lockStatus = accountLockoutManager.isAccountLocked(testEmail);
    assert(lockStatus.locked === true, 'Percobaan ke-5: Akun BERHASIL DIKUNCI');
    assert(lockStatus.remainingMinutes > 0, `Lockout aktif dengan durasi sisa: ${lockStatus.remainingMinutes} menit`);

    // Reset login sukses
    accountLockoutManager.resetFailedAttempts(testEmail);
    assert(!accountLockoutManager.isAccountLocked(testEmail).locked, 'Reset failed attempts berhasil membuka kunci akun');

    // ----------------------------------------------------
    // TEST 3: XSS INPUT SANITIZER
    // ----------------------------------------------------
    console.log('\n--- [3/6] Testing XSS Input Sanitizer ---');
    const mockReq = {
        body: {
            username: '<script>alert("XSS")</script>UserGanteng',
            bio: '<img src=x onerror=alert(1)>Hallo teman',
            link: 'javascript:stealCookies()',
            password: 'My<Secret>Password123' // Password TIDAK boleh dirusak
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
    console.log('\n--- [4/6] Testing CSRF / Origin Validator ---');
    
    // Kasus 1: Request GET (aman, dilewati)
    let getPassed = false;
    originValidator({ method: 'GET', get: () => 'malicious.com' }, {}, () => { getPassed = true; });
    assert(getPassed, 'Request GET lolos tanpa batasan origin');

    // Kasus 2: Request POST dengan Same-Origin
    let sameOriginPassed = false;
    originValidator({
        method: 'POST',
        originalUrl: '/auth/login',
        get: (h) => (h === 'host' ? 'localhost:3000' : 'http://localhost:3000')
    }, {}, () => { sameOriginPassed = true; });
    assert(sameOriginPassed, 'Request POST dengan Same-Origin diizinkan');

    // Kasus 3: Request POST dari Domain Asing (Cross-Origin Attack)
    let blockedCode = 0;
    originValidator({
        method: 'POST',
        originalUrl: '/auth/login',
        get: (h) => (h === 'host' ? 'localhost:3000' : 'http://evil-attacker-site.com')
    }, {
        status: (code) => ({
            send: () => { blockedCode = code; }
        })
    }, () => {});
    assert(blockedCode === 403, 'Request POST dari domain asing DIBLOKIR dengan HTTP 403 Forbidden');

    // Kasus 4: Webhook Midtrans (Pengecualian yang sah)
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
    console.log('\n--- [5/6] Testing SQL Injection Detector ---');

    // Kasus 1: Input normal
    let normalReqPassed = false;
    sqlInjectionDetector({
        query: { game: 'mobile-legends', category: 'topup' },
        body: {},
        params: {}
    }, {}, () => { normalReqPassed = true; });
    assert(normalReqPassed, 'Input pencarian game normal lolos tanpa halangan');

    // Kasus 2: Serangan UNION SELECT
    let sqliBlocked = false;
    sqlInjectionDetector({
        query: { q: "1' UNION SELECT null, username, password FROM users --" },
        body: {},
        params: {}
    }, {
        status: (code) => ({
            send: () => { sqliBlocked = (code === 400); },
            json: () => { sqliBlocked = (code === 400); }
        })
    }, () => {});
    assert(sqliBlocked, 'Serangan SQLi "UNION SELECT" berhasil DIBLOKIR dengan HTTP 400');

    // Kasus 3: Serangan Boolean Blind ' OR '1'='1
    let booleanSqliBlocked = false;
    sqlInjectionDetector({
        query: {},
        body: { username: "admin' OR '1'='1" },
        params: {}
    }, {
        status: (code) => ({
            send: () => { booleanSqliBlocked = (code === 400); },
            json: () => { booleanSqliBlocked = (code === 400); }
        })
    }, () => {});
    assert(booleanSqliBlocked, 'Serangan SQLi boolean blind (" OR 1=1) berhasil DIBLOKIR');

    // ----------------------------------------------------
    // TEST 6: SECURITY AUDIT LOGGER
    // ----------------------------------------------------
    console.log('\n--- [6/6] Testing Security Audit Logger ---');
    logSecurityEvent('SECURITY_TEST_AUDIT', 'Audit trail verification entry', null, SEVERITY.INFO);

    const logExists = fs.existsSync(logFilePath);
    assert(logExists, 'File logs/security.log berhasil dibuat');

    if (logExists) {
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        assert(logContent.includes('SECURITY_TEST_AUDIT'), 'Log entry terverifikasi tersimpan di dalam file audit');
    }

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`🏁 HASIL AUDIT KEAMANAN: ${passedTests} / ${totalTests} PENGUJIAN LULUS (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log('====================================================');

    if (passedTests === totalTests) {
        console.log('✨ Sistem Keamanan ZenithPrime siap untuk produksi & push ke GitHub!\n');
        process.exit(0);
    } else {
        console.error('⚠️ Terdapat pengujian keamanan yang gagal. Harap tinjau kembali.');
        process.exit(1);
    }
}

runSecuritySuite().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
