exports.contact = (req, res) => {
    res.render('pages/contact', {
        title: 'Hubungi Kami - ZenithPrime',
        layout: 'layouts/main',
        active: 'support',
        user: req.session.user || null
    });
};

exports.terms = (req, res) => {
    res.render('pages/terms', {
        title: 'Syarat & Ketentuan - ZenithPrime',
        layout: 'layouts/main',
        active: 'support',
        user: req.session.user || null
    });
};

exports.privacy = (req, res) => {
    res.render('pages/privacy', {
        title: 'Kebijakan Privasi - ZenithPrime',
        layout: 'layouts/main',
        active: 'support',
        user: req.session.user || null
    });
};

exports.faq = (req, res) => {
    res.render('pages/faq', {
        title: 'F.A.Q - ZenithPrime',
        layout: 'layouts/main',
        active: 'support',
        user: req.session.user || null
    });
};