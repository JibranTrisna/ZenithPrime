const ReviewModel = require('../models/reviewModel');

exports.submitReview = async (req, res) => {
    try {
        let { order_id, rating, comment } = req.body; 
        const userId = req.session.user.id;

        if(order_id) order_id = order_id.trim();

        if (!rating || !order_id) {
            req.flash('error_msg', 'Data tidak lengkap.');
            return res.redirect('/history');
        }

        const alreadyReviewed = await ReviewModel.checkIfReviewed(order_id);
        if (alreadyReviewed) {
            req.flash('error_msg', 'Anda sudah mengulas transaksi ini.');
            return res.redirect('/history');
        }

        await ReviewModel.createReview(userId, order_id, rating, comment);

        req.flash('success_msg', 'Terima kasih atas ulasan Anda! ⭐');
        res.redirect('/history');

    } catch (error) {
        console.error("Submit Review Error:", error);
        req.flash('error_msg', 'Gagal mengirim ulasan.');
        res.redirect('/history');
    }
};