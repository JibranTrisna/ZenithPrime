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
    req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Admin.');
    res.redirect('/auth/login');
};

exports.isStaff = (req, res, next) => {
    if (req.session.user && (req.session.user.role === 'staff' || req.session.user.role === 'admin')) {
        return next();
    }
    req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Staff.');
    res.redirect('/auth/login');
};

exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (req.session.user && roles.includes(req.session.user.role)) {
            return next();
        }
        req.flash('error_msg', 'Akses Ditolak! Anda tidak memiliki izin untuk masuk ke area ini.');
        return res.redirect('/');
    };
};