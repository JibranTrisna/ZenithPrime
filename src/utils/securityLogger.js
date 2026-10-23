const fs = require('fs');
const path = require('path');

// Pastikan direktori logs/ tersedia
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    try {
        fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {
        console.error('⚠️ Gagal membuat direktori logs:', err.message);
    }
}

const logFilePath = path.join(logDir, 'security.log');

/**
 * Level keparahan keamanan
 */
const SEVERITY = {
    INFO: 'INFO',
    WARN: 'WARN',
    ALERT: 'ALERT',
    CRITICAL: 'CRITICAL'
};

/**
 * Mencatat kejadian keamanan ke logs/security.log dan console
 * Menggunakan appendFileSync agar log tersimpan seketika di disk (tahan crash / exploit evasion).
 * @param {string} eventType - Tipe kejadian (misal: 'SQLI_ATTEMPT', 'AUTH_FAILED', 'ACCOUNT_LOCKED', 'XSS_ATTEMPT', 'CSRF_BLOCKED')
 * @param {string} message - Deskripsi detail kejadian
 * @param {object} [req] - Express request object (opsional)
 * @param {string} [severity='WARN'] - Level keparahan ('INFO', 'WARN', 'ALERT', 'CRITICAL')
 */
function logSecurityEvent(eventType, message, req = null, severity = SEVERITY.WARN) {
    try {
        const timestamp = new Date().toISOString();
        const ip = req ? (req.ip || req.connection?.remoteAddress || 'unknown') : 'N/A';
        const method = req ? (req.method || 'N/A') : 'N/A';
        const url = req ? (req.originalUrl || req.url || 'N/A') : 'N/A';
        
        let userAgent = 'unknown';
        if (req) {
            if (typeof req.get === 'function') {
                userAgent = req.get('user-agent') || 'unknown';
            } else if (req.headers && req.headers['user-agent']) {
                userAgent = req.headers['user-agent'];
            }
        }

        const userId = (req && req.session && req.session.user) ? `UID:${req.session.user.id}(${req.session.user.role})` : 'Anonymous';

        const logEntry = `[${timestamp}] [${severity}] [${eventType}] IP: ${ip} | User: ${userId} | ${method} ${url} | UA: "${userAgent}" | Message: ${message}\n`;

        // Tulis langsung ke disk agar bukti audit tidak hilang jika proses terhenti tiba-tiba
        fs.appendFileSync(logFilePath, logEntry, 'utf8');

        // Console warning terformat untuk visibility developer
        const icon = severity === SEVERITY.CRITICAL || severity === SEVERITY.ALERT ? '🚨' : (severity === SEVERITY.WARN ? '⚠️' : 'ℹ️');
        console.warn(`${icon} [Security - ${eventType}] [${severity}] ${message} (IP: ${ip}, User: ${userId}, URL: ${method} ${url})`);
    } catch (err) {
        console.error('⚠️ Gagal memproses security log:', err.message);
    }
}

module.exports = {
    logSecurityEvent,
    SEVERITY,
    logFilePath
};
