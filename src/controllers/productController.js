const ProductModel = require('../models/productModel');
const UpdateModel = require('../models/updateModel');
const ReviewModel = require('../models/reviewModel');

exports.getAllGames = async (req, res) => {
    try {
        const games = await ProductModel.getAllGames();
        const categories = [...new Set(games.map(game => game.category))];
        const updates = await UpdateModel.getLatestUpdates(4);
        const reviews = await ReviewModel.getLatestReviews(); 
        const promos = [
            { title: "Mobile Legends Starlight", desc: "Diskon 20% member baru!", type: "video", src: "/images/ML.mp4", link: "/topup/mobile-legends" },
            { title: "Valorant Night Market", desc: "Bonus Points 2x lipat.", type: "video", src: "/images/Valo.mp4", link: "/topup/valorant" },
            { title: "Free Fire Booyah Pass", desc: "Skin Senjata terbaru.", type: "video", src: "/images/FF.mp4", link: "/topup/free-fire" }
        ];

        res.render('dashboard/index', {
            title: 'ZenithPrime - Katalog Lengkap',
            layout: 'layouts/main',
            active: 'home',
            games: games,
            categories: categories,
            promos: promos,
            updates: updates,
            reviews: reviews,
            user: req.session.user || null
        });

    } catch (error) {
        console.error("Error in Dashboard:", error);
        res.status(500).send("Server Error");
    }
};

exports.getAllGamesCatalog = async (req, res) => {
    try {
        const games = await ProductModel.getAllGames();
        const categories = [...new Set(games.map(game => game.category).filter(Boolean))];
        
        res.render('topup/index', { 
            title: 'Katalog Game Lengkap - ZenithPrime',
            layout: 'layouts/main',
            active: 'games',
            games: games,
            categories: categories,
            user: req.session.user || null
        });
    } catch (error) {
        console.error("Error in Catalog:", error);
        res.status(500).send("Database Error");
    }
};

exports.getGameDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        
        const game = await ProductModel.getGameBySlug(slug);

        if (!game) {
            return res.status(404).render('404', {
                title: 'Halaman Tidak Ditemukan',
                layout: 'layouts/main',
                active: 'home',
                user: req.session.user || null
            });
        }

        const products = await ProductModel.getProductsByGameSlug(slug);

        res.render('topup/detail', {
            title: `Top Up ${game.name} - ZenithPrime`,
            layout: 'layouts/main',
            active: 'home',
            game: game,
            products: products,
            user: req.session.user || null
        });

    } catch (error) {
        console.error("Error in Detail:", error);
        res.status(500).send("Server Error");
    }
};