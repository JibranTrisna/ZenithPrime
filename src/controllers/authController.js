const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { accountLockoutManager, validatePasswordStrength } = require('../middlewares/securityMiddleware');
const { logSecurityEvent, SEVERITY } = require('../utils/securityLogger');

exports.getLoginPage = (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') return res.redirect('/admin');
        if (req.session.user.role === 'staff') return res.redirect('/staff');
        return res.redirect('/');
    }
    
    res.render('auth/login', {
        title: 'Login - ZenithPrime',
        layout: false,
        active: 'login' 
    });
};

exports.getRegisterPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('auth/register', {
        title: 'Register - ZenithPrime',
        layout: false,
        active: 'register'
    });
};

exports.registerProcess = async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Konfirmasi password tidak cocok!');
            return res.redirect('/auth/register');
        }

        // Validasi kebijakan kekuatan password
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            req.flash('error_msg', passwordValidation.message);
            return res.redirect('/auth/register');
        }

        const checkEmail = await UserModel.findByEmailOrPhone(email);
        const checkPhone = await UserModel.findByEmailOrPhone(phone);

        if (checkEmail.length > 0 || checkPhone.length > 0) {
            req.flash('error_msg', 'Email atau Nomor Telepon sudah terdaftar!');
            return res.redirect('/auth/register');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await UserModel.create({
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword
        });

        logSecurityEvent('USER_REGISTERED', `Pendaftaran user baru berhasil: ${email} (${phone})`, req, SEVERITY.INFO);

        req.flash('success_msg', 'Registrasi berhasil! Silakan login.');
        res.redirect('/auth/login');

    } catch (error) {
        console.error("Register Error:", error);
        req.flash('error_msg', 'Terjadi kesalahan server saat registrasi.');
        res.redirect('/auth/register');
    }
};

exports.loginProcess = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        if (!identifier || !password) {
            req.flash('error_msg', 'Email/No. HP dan Password wajib diisi.');
            return res.redirect('/auth/login');
        }

        // 🛡️ 1. Cek status lockout akun (Anti Brute-Force)
        const lockoutStatus = accountLockoutManager.isAccountLocked(identifier);
        if (lockoutStatus.locked) {
            logSecurityEvent('ACCOUNT_LOCKED_ATTEMPT', `Percobaan login ke akun terkunci: "${identifier}"`, req, SEVERITY.ALERT);
            req.flash('error_msg', `Akun ini terkunci sementara karena terlalu banyak percobaan gagal. Silakan tunggu ${lockoutStatus.remainingMinutes} menit demi keamanan.`);
            return res.redirect('/auth/login');
        }

        const users = await UserModel.findByEmailOrPhone(identifier);

        if (users.length === 0) {
            const remaining = accountLockoutManager.recordFailedAttempt(identifier, req);
            const alertMsg = remaining <= 0 
                ? 'Terlalu banyak percobaan gagal. Akun telah dikunci sementara selama 15 menit.' 
                : `Akun tidak ditemukan atau password salah. (Sisa percobaan: ${remaining})`;
            req.flash('error_msg', alertMsg);
            return res.redirect('/auth/login');
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const remaining = accountLockoutManager.recordFailedAttempt(identifier, req);
            const alertMsg = remaining <= 0 
                ? 'Terlalu banyak percobaan gagal. Akun telah dikunci sementara selama 15 menit.' 
                : `Password salah! Sisa percobaan: ${remaining}`;
            req.flash('error_msg', alertMsg);
            return res.redirect('/auth/login');
        }

        // 🛡️ 2. Login Sukses: Reset counter kegagalan
        accountLockoutManager.resetFailedAttempts(identifier);

        // Buat ulang ID sesi setelah login berhasil → mencegah Session Fixation
        await new Promise((resolve, reject) => {
            req.session.regenerate((err) => (err ? reject(err) : resolve()));
        });

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        logSecurityEvent('AUTH_SUCCESS', `Login berhasil untuk User ID: ${user.id} (${user.email}), Role: ${user.role}`, req, SEVERITY.INFO);

        req.flash('success_msg', `Selamat datang kembali, ${user.name}!`);

        let target = '/';
        if (user.role === 'admin') target = '/admin';
        else if (user.role === 'staff') target = '/staff';

        return req.session.save(() => res.redirect(target));

    } catch (error) {
        console.error("Login Error:", error);
        req.flash('error_msg', 'Terjadi kesalahan sistem saat login.');
        res.redirect('/auth/login');
    }
};

exports.logout = (req, res) => {
    const userEmail = req.session?.user?.email || 'Unknown';
    logSecurityEvent('AUTH_LOGOUT', `User logout: ${userEmail}`, req, SEVERITY.INFO);

    req.session.destroy((err) => {
        if (err) {
            console.error("Gagal logout:", err);
            return res.redirect('/');
        }
        res.redirect('/auth/login');
    });
};

// ==========================================
// 🔐 FITUR LUPA & RESET PASSWORD
// ==========================================

exports.getForgotPasswordPage = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/forgot-password', {
        title: 'Lupa Password - ZenithPrime',
        layout: false,
        active: 'forgot-password',
        resetLink: req.flash('reset_link')[0] || null
    });
};

exports.forgotPasswordProcess = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            req.flash('error_msg', 'Silakan masukkan email Anda.');
            return res.redirect('/auth/forgot-password');
        }

        const users = await UserModel.findByEmailOrPhone(email.trim());

        if (users.length === 0) {
            req.flash('error_msg', 'Email tidak terdaftar dalam sistem kami.');
            return res.redirect('/auth/forgot-password');
        }

        const user = users[0];
        // Generate secure 64-character token
        const token = crypto.randomBytes(32).toString('hex');
        // Berlaku selama 1 jam
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await UserModel.createPasswordReset(user.email, token, expiresAt);

        logSecurityEvent('PASSWORD_RESET_REQUESTED', `Token pemulihan password dibuat untuk: ${user.email}`, req, SEVERITY.INFO);

        const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;
        console.log(`\n🔑 [PASSWORD RESET LINK UNTUK ${user.email}]:\n${resetLink}\n`);

        req.flash('success_msg', 'Tautan pemulihan password berhasil dibuat!');
        req.flash('reset_link', resetLink); // Ditampilkan di UI pada mode pengembangan / tanpa SMTP
        res.redirect('/auth/forgot-password');

    } catch (error) {
        console.error("Forgot Password Error:", error);
        req.flash('error_msg', 'Terjadi kesalahan sistem saat memproses permintaan.');
        res.redirect('/auth/forgot-password');
    }
};

exports.getResetPasswordPage = async (req, res) => {
    const { token } = req.params;

    try {
        const resetEntry = await UserModel.findPasswordReset(token);

        if (!resetEntry) {
            req.flash('error_msg', 'Tautan pemulihan password tidak valid atau sudah kedaluwarsa.');
            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password', {
            title: 'Buat Password Baru - ZenithPrime',
            layout: false,
            active: 'reset-password',
            token: token,
            email: resetEntry.email
        });

    } catch (error) {
        console.error("Get Reset Password Error:", error);
        req.flash('error_msg', 'Terjadi kesalahan saat memvalidasi tautan.');
        res.redirect('/auth/forgot-password');
    }
};

exports.resetPasswordProcess = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        const resetEntry = await UserModel.findPasswordReset(token);

        if (!resetEntry) {
            req.flash('error_msg', 'Tautan pemulihan password tidak valid atau sudah kedaluwarsa.');
            return res.redirect('/auth/forgot-password');
        }

        // Validasi kebijakan kekuatan password
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            req.flash('error_msg', passwordValidation.message);
            return res.redirect(`/auth/reset-password/${token}`);
        }

        if (password !== confirmPassword) {
            req.flash('error_msg', 'Konfirmasi password baru tidak cocok!');
            return res.redirect(`/auth/reset-password/${token}`);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await UserModel.updatePassword(resetEntry.user_id, hashedPassword);
        // Hapus token setelah berhasil digunakan (single-use)
        await UserModel.deletePasswordReset(resetEntry.email);

        // Reset kegagalan login sebelumnya jika ada
        accountLockoutManager.resetFailedAttempts(resetEntry.email);

        logSecurityEvent('PASSWORD_RESET_SUCCESS', `Password berhasil direset untuk email: ${resetEntry.email}`, req, SEVERITY.INFO);

        req.flash('success_msg', 'Password berhasil diperbarui! Silakan login dengan password baru.');
        res.redirect('/auth/login');

    } catch (error) {
        console.error("Reset Password Process Error:", error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui password.');
        res.redirect(`/auth/reset-password/${token}`);
    }
};
