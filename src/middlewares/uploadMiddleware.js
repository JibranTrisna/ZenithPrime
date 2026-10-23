const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (subfolder = 'uploads', filenamePrefix = 'file') => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = path.join(__dirname, '../../public/images', subfolder);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const namePart = (req.body && req.body.slug) ? req.body.slug : filenamePrefix;
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `${namePart}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        const validExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname);
        const validMime = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
        if (!validExt || !validMime) {
            return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
        }
        cb(null, true);
    };

    return multer({
        storage: storage,
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: fileFilter
    });
};

const uploadGameThumbnail = createUploader('games', 'game');
const uploadGeneral = createUploader('uploads', 'upload');
const uploadJokiProof = createUploader('joki-proofs', 'proof');

module.exports = {
    createUploader,
    uploadGameThumbnail,
    uploadGeneral,
    uploadJokiProof,
    upload: uploadGeneral
};