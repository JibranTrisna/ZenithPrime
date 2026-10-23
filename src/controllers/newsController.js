const UpdateModel = require('../models/updateModel');

exports.index = async (req, res) => {
    const updates = await UpdateModel.getAllUpdates();
    res.render('news/index', {
        title: 'Berita & Update - ZenithPrime',
        layout: 'layouts/main',
        active: 'news',
        updates: updates,
        user: req.session.user || null
    });
};

exports.detail = async (req, res) => {
    const slug = req.params.slug;
    const news = await UpdateModel.getUpdateBySlug(slug);

    if (!news) return res.status(404).render('404', { layout: 'layouts/main', title: 'Not Found' });

    res.render('news/detail', {
        title: `${news.title} - ZenithPrime`,
        layout: 'layouts/main',
        active: 'news',
        news: news,
        user: req.session.user || null
    });
};