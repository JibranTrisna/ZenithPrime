const { logSecurityEvent, SEVERITY } = require('../utils/securityLogger');

exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Silakan login terlebih dahulu.');
    res.redirect('/auth/login');
};

exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
};

exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    logSecurityEvent('UNAUTHORIZED_ACCESS', `Akses ilegal ke endpoint Admin: ${req.originalUrl}`, req, SEVERITY.ALERT);
    req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Admin.');
    res.redirect('/auth/login');
};

exports.isStaff = (req, res, next) => {
    if (req.session.user && (req.session.user.role === 'staff' || req.session.user.role === 'admin')) {
        return next();
    }
    logSecurityEvent('UNAUTHORIZED_ACCESS', `Akses ilegal ke endpoint Staff: ${req.originalUrl}`, req, SEVERITY.WARN);
    req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Staff.');
    res.redirect('/auth/login');
};

exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (req.session.user && roles.includes(req.session.user.role)) {
            return next();
        }
        logSecurityEvent('UNAUTHORIZED_ROLE_ACCESS', `User ${req.session?.user?.id || 'Guest'} mencoba akses peran [${roles.join(', ')}] pada ${req.originalUrl}`, req, SEVERITY.WARN);
        req.flash('error_msg', 'Akses Ditolak! Anda tidak memiliki izin untuk masuk ke area ini.');
        return res.redirect('/');
    };
};
