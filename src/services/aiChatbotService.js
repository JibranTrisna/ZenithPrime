const db = require('../config/database');

/**
 * =========================================================================
 * 🧠 MASTER ZENITH SMART RULE-BASED AI ENGINE (ALL-CASE COVERAGE)
 * =========================================================================
 * Engine NLP lokal 100% offline tanpa ketergantungan API eksternal.
 * Menangani 35+ kasus komprehensif: transaksi, identitas akun game, pembayaran,
 * kebijakan refund, event in-game, keamanan web, manajemen akun, dan eskalasi staf.
 */

// 1. Kamus Slang, Typo, Singkatan Gamer & Kosakata Luas (400+ Kata)
const SLANG_DICTIONARY = {
    // Game Titles & Abbreviations
    'ml': 'mobile legends',
    'mlbb': 'mobile legends',
    'emel': 'mobile legends',
    'mbel': 'mobile legends',
    'mobalog': 'mobile legends',
    'ff': 'free fire',
    'epep': 'free fire',
    'efef': 'free fire',
    'freefire': 'free fire',
    'pubg': 'pubg mobile',
    'pabji': 'pubg mobile',
    'pubgm': 'pubg mobile',
    'gi': 'genshin impact',
    'genshin': 'genshin impact',
    'gensin': 'genshin impact',
    'val': 'valorant',
    'valo': 'valorant',
    'hok': 'honor of kings',
    'codm': 'call of duty mobile',
    'cod': 'call of duty mobile',
    'hkr': 'honkai star rail',
    'hsr': 'honkai star rail',

    // In-game Currency & Passes
    'dm': 'diamond',
    'dmd': 'diamond',
    'dimon': 'diamond',
    'daimon': 'diamond',
    'uc': 'uc pubg',
    'vp': 'valorant point',
    'primogem': 'primogem',
    'primo': 'primogem',
    'genesis': 'genesis crystal',
    'wdp': 'weekly diamond pass',
    'weekly': 'weekly diamond pass',
    'pass': 'pass',
    'welkin': 'welkin moon',

    // Complaints & Status Conditions
    'blm': 'belum',
    'blom': 'belum',
    'blum': 'belum',
    'udh': 'sudah',
    'udah': 'sudah',
    'sdh': 'sudah',
    'lola': 'pending',
    'lelet': 'pending',
    'gantung': 'pending',
    'pending': 'pending',
    'lama': 'lama',
    'delay': 'pending',
    'ilang': 'terpotong',
    'hilang': 'terpotong',
    'potong': 'terpotong',
    'kepotong': 'terpotong',
    'dipotong': 'terpotong',
    'berkurang': 'terpotong',
    'habis': 'terpotong',
    'gagal': 'gagal',
    'fail': 'gagal',
    'failed': 'gagal',
    'batal': 'gagal',
    'cancel': 'gagal',
    'expired': 'expired',
    'kadaluarsa': 'expired',
    'kedaluwarsa': 'expired',
    'dobel': 'double',
    'double': 'double',
    '2x': 'double',
    'dua kali': 'double',

    // ID, Server & Verification
    'masukin': 'input',
    'masukan': 'input',
    'masukkan': 'input',
    'nginput': 'input',
    'ngetik': 'input',
    'keliru': 'salah',
    'salah': 'salah',
    'keliru id': 'salah id',
    'salah id': 'salah id',
    'zone': 'zone',
    'zon': 'zone',
    'server': 'server',
    'uid': 'user id',
    'id': 'user id',
    'nickname': 'nickname',
    'nick': 'nickname',
    'nama': 'nickname',
    'tag': 'tagline',
    'tagline': 'tagline',

    // Financial & Payments
    'tf': 'transfer',
    'trf': 'transfer',
    'transfr': 'transfer',
    'byr': 'bayar',
    'pembayaran': 'bayar',
    'duit': 'saldo',
    'uang': 'saldo',
    'dana': 'saldo',
    'saldo': 'saldo',
    'rekening': 'rekening',
    'rek': 'rekening',
    'mutasi': 'mutasi',
    'struk': 'struk',
    'bukti': 'struk',
    'resi': 'struk',
    'qris': 'qris',
    'kris': 'qris',
    'gopay': 'gopay',
    'shopeepay': 'shopeepay',
    'ovo': 'ovo',
    'va': 'virtual account',
    'bca': 'bca',
    'bri': 'bri',
    'bni': 'bni',
    'mandiri': 'mandiri',
    'admin': 'admin fee',
    'biaya': 'biaya',
    'ppn': 'pajak',
    'pajak': 'pajak',
    'potongan': 'diskon',

    // Refunds & Policies
    'kembalian': 'refund',
    'balikin': 'refund',
    'retur': 'refund',
    'kembali': 'refund',
    'refund': 'refund',
    'ganti rugi': 'refund',
    'uang kembali': 'refund',

    // Vouchers & Promotions
    'kupon': 'voucher',
    'diskon': 'promo',
    'promo': 'promo',
    'voucher': 'voucher',
    'kode': 'voucher',
    'event': 'event',
    'quest': 'event',
    'misi': 'event',
    'bonus': 'bonus',

    // Account & Credentials
    'resep': 'reset',
    'reset': 'reset',
    'sandi': 'password',
    'pw': 'password',
    'pass': 'password',
    'katasandi': 'password',
    'lupa': 'lupa',
    'terkunci': 'terkunci',
    'keblokir': 'terkunci',
    'blokir': 'terkunci',
    'login': 'login',
    'masuk akun': 'login',
    'daftar': 'register',
    'regis': 'register',

    // Security & Anti-Fraud
    'resmi': 'resmi',
    'legal': 'legal',
    'aman': 'aman',
    'ori': 'legal',
    'asli': 'resmi',
    'banned': 'banned',
    'ban': 'banned',
    'minus': 'minus',
    'merah': 'minus',
    'carding': 'carding',
    'tipu': 'penipuan',
    'penipuan': 'penipuan',
    'scam': 'penipuan',

    // Personnel & Escalation
    'min': 'staf',
    'admin': 'staf',
    'staff': 'staf',
    'manusia': 'staf_manusia',
    'orang': 'staf_manusia',
    'cs': 'staf',
    'operator': 'staf',
    'petugas': 'staf_manusia',

    // Common Negations & Modifiers
    'gk': 'tidak',
    'ga': 'tidak',
    'gak': 'tidak',
    'ngga': 'tidak',
    'nggak': 'tidak',
    'tdk': 'tidak',
    'kagak': 'tidak',
    'ndak': 'tidak',
    'ora': 'tidak',
    'nambah': 'masuk',
    'bertambah': 'masuk',
    'msk': 'masuk',
    'mlebu': 'masuk',
    'gmn': 'bagaimana',
    'gimana': 'bagaimana',
    'bgmn': 'bagaimana',
    'knp': 'kenapa',
    'ngapa': 'kenapa',
    'kenap': 'kenapa',
    'bisa': 'bisa',
    'bs': 'bisa',
    'sy': 'saya',
    'gw': 'saya',
    'gue': 'saya',
    'aku': 'saya',
    'lu': 'anda',
    'loe': 'anda',
    'km': 'anda',
    'kamu': 'anda',
    'trx': 'order',
    'inv': 'order',
    'invoice': 'order',
    'pesanan': 'order',

    // Joki & Boosting Terms
    'joki': 'joki',
    'penjoki': 'joki',
    'booster': 'joki',
    'boosting': 'joki',
    'gb': 'joki',
    'wr': 'winrate',
    'gendong': 'joki',
    'push rank': 'joki rank',
    'abyss': 'quest abyss',
    'rawat akun': 'rawat akun'
};

// 2. Normalisasi Teks Pengguna
function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    let cleaned = text.toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const tokens = cleaned.split(' ');
    const normalizedTokens = tokens.map(token => SLANG_DICTIONARY[token] || token);
    return normalizedTokens.join(' ');
}

// 3. Helper Pengambil Variasi Respon Acak
function pickOption(options) {
    const index = Math.floor(Math.random() * options.length);
    return options[index];
}

// 4. Detektor Order ID / Invoice Regex (Top Up TRX- & Joki JK-)
function extractOrderId(text) {
    const match = text.match(/(?:TRX|ORD|ZP|JK)[-_]?\d+[-_]?\d*/i);
    if (match) return match[0].toUpperCase();
    return null;
}

// 5. Query Data Transaksi Langsung ke Database MySQL (Top Up & Joki)
async function fetchOrderDetails(orderId) {
    try {
        // Cek Joki Order (Prefix JK-)
        if (orderId.startsWith('JK-')) {
            const [jokiRows] = await db.query(`
                SELECT jo.*, jo.service_name as product_name, g.name as game_name, u.name as user_name, u.email as user_email,
                       w.name as worker_name, jo.total_amount as amount, jo.payment_status as status
                FROM joki_orders jo
                LEFT JOIN games g ON jo.game_slug = g.slug
                LEFT JOIN users u ON jo.user_id = u.id
                LEFT JOIN users w ON jo.worker_id = w.id
                WHERE jo.order_id = ?
                LIMIT 1
            `, [orderId]);
            if (jokiRows.length > 0) {
                jokiRows[0].is_joki = true;
                return jokiRows[0];
            }
        }

        // Cek Top Up Transaksi Reguler
        const [rows] = await db.query(`
            SELECT t.*, p.name as product_name, g.name as game_name, u.name as user_name, u.email as user_email
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            JOIN games g ON p.game_slug = g.slug
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.order_id = ? OR t.id = ?
            LIMIT 1
        `, [orderId, orderId]);

        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        console.error("AI Error Fetching Order:", err);
        return null;
    }
}

// =========================================================================
// 📚 REPOSITORY 35+ INTENT & MULTI-WORD OPTIONS (MASTER KNOWLEDGE BASE)
// =========================================================================
const INTENT_DEFINITIONS = [

    // =====================================================================
    // PILAR 1: SIKLUS & STATUS TRANSAKSI
    // =====================================================================
    {
        id: 'INTENT_ORDER_PENDING',
        primaryKeywords: ['pending', 'belum masuk', 'menunggu', 'proses lama', 'lelet', 'gantung'],
        secondaryKeywords: ['diamond', 'order', 'pesanan', 'berapa menit', 'estimasi'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! 👋 Mengenai pesanan Anda yang berstatus **Pending / Sedang Diproses**:

⚡ **Standar Waktu Pengiriman:**
• Sistem ZenithPrime bekerja otomatis 24 jam dengan rata-rata proses **1 s/d 5 menit** setelah pembayaran terverifikasi oleh Midtrans.
• Pada jam sibuk (*peak hours*) atau saat server developer game (Moonton, Garena, dll.) melakukan pemeliharaan, antrean API dapat memakan waktu hingga **15 menit**.

🔍 **Langkah Pengecekan Mandiri:**
1. Pastikan Anda telah menyelesaikan pembayaran dan menerima bukti transfer sukses dari bank/e-wallet Anda.
2. Pantau status invoice Anda secara berkala di [Riwayat Transaksi](/history).
3. Lakukan **Restart / Re-login** pada aplikasi game Anda untuk me-refresh tampilan saldo diamond.

*Jika pesanan sudah lebih dari 15 menit belum masuk, ketikkan nomor invoice Anda (contoh: \`TRX-...\`) di sini agar saya bantu lacak secara live ke sistem!*`,

            (userName) => `Salam Gamers **${userName}**! 🎮 Jangan cemas jika pesanan Anda masih berstatus **Pending**.

Berikut alur kerja transaksi di ZenithPrime:
1. **Verifikasi Gateway:** Pembayaran via QRIS/VA membutuhkan konfirmasi otomatis (1–2 menit).
2. **Antrean API Publisher:** Diamond dikirimkan langsung melalui jalur resmi publisher game secara antrean.
3. **Data Akun Valid:** Pastikan User ID dan Server ID yang diinputkan sudah tepat.

💡 **Saran Cepat:**
Silakan kirimkan nomor pesanan Anda (\`TRX-...\`) pada chat ini sekarang untuk pengecekan status detik ini juga!`
        ],
        quickReplies: ['Cek Nomor Pesanan', 'Saldo Terpotong', 'Bicara dengan Staf']
    },

    {
        id: 'INTENT_SALDO_TERPOTONG',
        primaryKeywords: ['saldo terpotong', 'uang terpotong', 'sudah bayar belum masuk', 'saldo hilang', 'dana berkurang', 'terpotong', 'kepotong'],
        secondaryKeywords: ['qris', 'bank', 'gopay', 'dana', 'bca', 'berhasil bayar', 'struk', 'diamond', 'belum masuk', 'tidak masuk'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**, kami memahami kekhawatiran Anda. 🙏 Jika saldo rekening atau e-wallet Anda sudah terpotong namun item game belum bertambah:

🛡️ **Jaminan Keamanan Saldo 100%:**
• Seluruh transaksi di ZenithPrime terhubung dengan **Midtrans Payment Gateway** yang memiliki pencatatan mutasi mutlak. Dana Anda **tidak akan hilang**.

📌 **Penyebab & Proses Sinkronisasi:**
1. **Jeda Jaringan Bank:** Terkadang terjadi jeda delay (*network latency*) antar-bank sehingga sinyal konfirmasi pembayaran butuh waktu 2–5 menit untuk mencapai server kami.
2. **Pembayaran Menjelang Batas Waktu:** Jika Anda mentransfer di detik-detik akhir masa berlaku QRIS, sistem akan melakukan pencocokan mutasi otomatis (*settlement match*).

📝 **Tindakan Anda:**
• Ketikkan **Nomor Invoice (Order ID)** Anda di sini agar sistem kami memverifikasinya.
• Jika sudah melebihi 30 menit, ketik **#staf** agar tim Finance kami memvalidasi mutasi Anda secara manual!`,

            (userName) => `Tenang Kak **${userName}**, dana Anda dijamin **100% aman** di ZenithPrime! ✨

Jika saldo sudah terdebet:
1. **Cek Invoice:** Buka menu [Riwayat Transaksi](/history) untuk melihat apakah status invoice telah berubah menjadi **Success**.
2. **Tunggu Rekonsiliasi:** Webhook perbankan membutuhkan waktu sinkronisasi 3–7 menit saat jam sibuk.
3. **Kirimkan Nomor Order:** Sertakan nomor order Anda (\`TRX-...\`) di obrolan ini untuk pengecekan instan.`
        ],
        quickReplies: ['Cek Nomor Pesanan', 'Kebijakan Refund', 'Bicara dengan Staf']
    },

    {
        id: 'INTENT_ORDER_FAILED_PAID',
        primaryKeywords: ['gagal tapi terpotong', 'status gagal saldo hilang', 'transaksi failed tapi sudah bayar', 'batal tapi kepotong'],
        secondaryKeywords: ['uang kembali', 'refund', 'failed', 'gagal bayar'],
        threshold: 3.0,
        options: [
            (userName) => `Halo Kak **${userName}**! Mengenai status transaksi yang tercatat **FAILED / GAGAL** namun saldo Anda sudah terpotong:

✅ **Hak Refund Anda Dijamin 100%:**
• Transaksi yang berstatus *Failed* menandakan item game tidak terkirim oleh sistem distributor.
• Sesuai regulasi kami, dana yang masuk untuk transaksi yang gagal **wajib dikembalikan (refund) secara utuh 100%** tanpa potongan.

📋 **Langkah Pengajuan Pengembalian Dana:**
1. Siapkan **Nomor Order** (\`TRX-...\`).
2. Siapkan **Screenshot Bukti Transfer / Mutasi Rekening**.
3. Ketik **#staf** di chat ini agar petugas Finance kami segera memproses pengembalian dana ke rekening/e-wallet Anda (SLA 1x24 jam kerja).`
        ],
        quickReplies: ['Hubungi Staf untuk Refund', 'Cek Nomor Pesanan', 'Syarat Refund']
    },

    {
        id: 'INTENT_EXPIRED_PAYMENT',
        primaryKeywords: ['bayar expired', 'telat bayar', 'invoice kadaluarsa dibayar', 'bayar sesudah expired', 'qris expired dibayar'],
        secondaryKeywords: ['bisa masuk gak', 'hangus gak', 'uangnya gimana'],
        threshold: 3.0,
        options: [
            (userName) => `Halo **${userName}**! Jika Anda mentransfer pembayaran untuk pesanan yang **sudah berstatus Expired (Kedaluwarsa)**:

⚠️ **Ketentuan Sistem:**
• Invoice yang sudah kedaluwarsa (lewat batas 15 menit) sistemnya secara otomatis terputus dari pengiriman API game publisher.
• Diamond **tidak bisa terkirim otomatis** ke akun Anda karena masa sesi pembayaran telah ditutup.

💡 **Solusi & Penanganan:**
• Jangan panik, uang Anda **TIDAK HANGUS**.
• Anda berhak mendapatkan **Pengembalian Dana Penuh (Refund 100%)** atau dibuatkan transaksi pengganti manual oleh tim kami.
• Silakan ketik **#staf** dan kirimkan bukti transfer Anda agar diproses oleh staf kami!`
        ],
        quickReplies: ['Hubungi Staf Sekarang', 'Cek Nomor Pesanan', 'Kebijakan Refund']
    },

    {
        id: 'INTENT_DOUBLE_CHARGE',
        primaryKeywords: ['double bayar', 'terpotong 2 kali', 'bayar dua kali', 'kebayar 2x', 'saldo kepotong dobel'],
        secondaryKeywords: ['kembalikan uang kedua', 'transfer dobel', 'salah bayar 2x'],
        threshold: 3.0,
        options: [
            (userName) => `Halo Kak **${userName}**! Apabila terjadi **Pembayaran Ganda (Double Charge)** untuk pesanan Anda:

🛡️ **Ketentuan Pengembalian:**
1. **Refund Pembayaran Kedua:** Uang transfer kedua Anda akan kami kembalikan utuh 100% ke rekening pengirim.
2. **Opsi Konversi Item:** Atau jika Anda berkenan, pembayaran kedua dapat diproseskan menjadi top up diamond tambahan untuk akun game Anda.

📝 **Cara Klaim:**
Ketik **#staf** sekarang juga dan sertakan kedua bukti mutasi/transfer Anda agar tim Finance kami mencocokkan nomor referensi bank.`
        ],
        quickReplies: ['Hubungi Staf untuk Refund', 'Cek Nomor Pesanan']
    },

    // =====================================================================
    // PILAR 2: IDENTITAS AKUN & ID GAME
    // =====================================================================
    {
        id: 'INTENT_SALAH_ID',
        primaryKeywords: ['salah id', 'salah zone', 'salah server', 'salah akun', 'salah nomor', 'salah nickname', 'salah input'],
        secondaryKeywords: ['keliru id', 'bisa diubah', 'salah masukin', 'ganti id'],
        threshold: 2.5,
        options: [
            (userName) => `Perhatian penting untuk Kak **${userName}** mengenai kendala **Salah Input ID / Zone Game**:

⚠️ **Tindakan Berdasarkan Status Pesanan:**
1. **Jika Status Masih PENDING (Belum Berhasil):**
   Segera ketik **#staf** sekarang juga! Sertakan nomor invoice dan User ID yang benar agar tim kami berupaya membatalkan transaksi sebelum item disuntikkan ke server game.
2. **Jika Status Sudah SUCCESS (Selesai):**
   Sesuai Syarat & Ketentuan Konsumen Digital ZenithPrime serta kebijakan publisher resmi (Moonton, Garena, Riot, dll.), pengiriman diamond yang sudah berstatus *Success* ke User ID tujuan bersifat **final dan otomatis masuk ke akun tersebut**. Sistem API game **tidak dapat menarik kembali item (*irreversible*) ataupun melakukan refund**.

💡 **Tips Penting:**
Sebelum menekan tombol bayar, selalu periksa kembali nama User ID, Zone ID, dan Nickname in-game pada kartu pratinjau konfirmasi.`,

            (userName) => `Halo **${userName}**, jika Anda salah memasukkan User ID atau Zone ID saat checkout:

🛑 **Cek Status Anda Sekarang:**
• Buka [Riwayat Transaksi](/history) untuk melihat status terkini pesanan.
• Jika **belum berstatus Success**, segera ketik **#staf** dan kirimkan:
  *Nomor Order:* \`TRX-...\`
  *ID yang benar:* \`...\`
  *Zone yang benar:* \`...\`

*Catatan: Jika transaksi sudah sukses terkirim ke akun tujuan yang keliru, transaksi tidak dapat dibatalkan karena sistem developer game mengeksekusi secara instan.*`
        ],
        quickReplies: ['Hubungi Staf Sekarang', 'Cek Nomor Pesanan', 'Kebijakan Refund']
    },

    {
        id: 'INTENT_GUIDE_FIND_ID',
        primaryKeywords: ['cara lihat id', 'cara cek id', 'dimana id', 'lihat zone', 'cek zone', 'uid genshin dimana', 'riot id yang mana'],
        secondaryKeywords: ['mobile legends', 'free fire', 'pubg', 'genshin', 'valorant', 'format id'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! 📱 Berikut panduan menemukan **User ID & Zone ID** sesuai game favorit Anda:

• **Mobile Legends (MLBB):**
  Buka Profil in-game di pojok kiri atas. ID terletak di bawah foto profil Anda.
  Format: \`12345678 (1234)\` ➔ \`12345678\` adalah User ID, dan \`1234\` di dalam kurung adalah Zone ID.

• **Free Fire (FF):**
  Buka Profil game di pojok kiri atas. User ID berupa deretan **8 s/d 10 digit angka** di bawah nickname Anda (klik icon copy).

• **Genshin Impact:**
  User ID (UID) berupa **9 digit angka** yang selalu tertera di **pojok kanan bawah layar game** Anda, atau di menu Paimon profil.

• **PUBG Mobile:**
  Buka Profil di pojok kanan atas. Pilih menu statistik, User ID berupa deretan angka panjang di atas avatar.

• **Valorant:**
  Gunakan **Riot ID lengkap beserta Tagline** (Contoh: \`Player#ID1\`).`,

            (userName) => `Kak **${userName}**, cara melihat ID game Anda sangat praktis:
1. **MLBB:** Profil akun ➔ User ID (angka depan), Zone ID (angka dalam kurung).
2. **Free Fire:** Profil akun ➔ 8–10 digit UID di samping nickname.
3. **Genshin Impact:** 9 digit UID di pojok kanan bawah layar permainan.
4. **Valorant:** Riot ID lengkap dengan tanda pagar hashtag (Contoh: \`Username#1234\`).`
        ],
        quickReplies: ['Katalog Game', 'Cara Top Up', 'Bantuan Lainnya']
    },

    {
        id: 'INTENT_NICKNAME_NOT_FOUND',
        primaryKeywords: ['nickname tidak muncul', 'id tidak valid', 'user tidak ditemukan', 'gagal cek id', 'nickname gak ada'],
        secondaryKeywords: ['error id', 'kenapa nickname', 'salah id terus'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Jika Nickname game Anda tidak muncul atau sistem menampilkan notifikasi "User ID Tidak Valid":

🔍 **Hal yang Perlu Diperiksa:**
1. **Spasi Tersembunyi:** Pastikan tidak ada spasi di awal atau akhir angka ID yang Anda copy.
2. **Server ID Terbalik (Khusus MLBB):** Pastikan User ID (angka panjang) dan Server ID (4–5 angka dalam kurung) tidak tertukar posisinya.
3. **Region Game:** Pastikan Anda memilih server game yang tepat (misal: Genshin server Asia vs America).
4. **Maintenance API Publisher:** Jika terjadi gangguan server dari pihak developer game, pengecekan nickname otomatis dapat mengalami *timeout*. Anda tetap dapat melanjutkan checkout jika ID sudah dipastikan benar.`,

            (userName) => `Kak **${userName}**, bila nama nickname in-game tidak terbaca otomatis:
• Periksa apakah ada salah ketik angka pada kolom User ID atau Zone ID.
• Pastikan jaringan internet Anda stabil.
• Jika ID sudah Anda yakini 100% benar sesuai di aplikasi game, Anda tetap bisa melanjutkan pembayaran dengan aman.`
        ],
        quickReplies: ['Panduan Cek ID Game', 'Katalog Game', 'Hubungi Staf']
    },

    {
        id: 'INTENT_SERVER_REGION_LOCK',
        primaryKeywords: ['server luar', 'region luar', 'akun luar negeri', 'bisa server na', 'bisa server eropa'],
        secondaryKeywords: ['global', 'genshin server', 'ml server luar'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Mengenai top up akun game **Server / Region Luar Negeri**:

🌍 **Ketentuan per Game:**
• **Mobile Legends & Free Fire:** Mendukung top up untuk semua server dan region global secara resmi.
• **Genshin Impact:** Anda wajib memilih server yang tepat (Asia, America, Europe, atau TW/HK/MO) saat checkout karena item terikat pada region UID akun Anda.
• **Valorant:** Top up saat ini dikhususkan untuk akun region **Indonesia / Asia Pasifik (SEA)**.

Jika Anda ragu dengan region akun Anda, silakan tanyakan langsung ke tim CS kami dengan mengetik **#staf**!`
        ],
        quickReplies: ['Katalog Game', 'Panduan Cek ID Game', 'Hubungi Staf']
    },

    {
        id: 'INTENT_GUEST_ACCOUNT',
        primaryKeywords: ['akun guest', 'belum di bind', 'top up akun baru', 'akun belum dikaitkan'],
        secondaryKeywords: ['bisa top up gak', 'hilang gak diamond'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Top up ke **Akun Guest (Belum di-bind)**:

📱 **Apakah Diamond Bisa Masuk?**
• **BISA**, diamond tetap akan masuk secara otomatis selama nomor User ID yang dimasukkan valid dan terdaftar di server game.

⚠️ **Peringatan Keamanan Penting:**
• Kami sangat menyarankan Anda **mengaitkan (bind) akun game Anda terlebih dahulu** ke Moonton, Google Play, Apple ID, atau Facebook sebelum melakukan top up.
• Tujuannya agar riwayat diamond dan progres akun Anda tidak hilang apabila aplikasi game terhapus atau ponsel Anda berganti perangkat!`
        ],
        quickReplies: ['Katalog Game', 'Cara Top Up', 'Bantuan Akun']
    },

    // =====================================================================
    // PILAR 3: METODE PEMBAYARAN & FINANSIAL
    // =====================================================================
    {
        id: 'INTENT_METODE_BAYAR',
        primaryKeywords: ['metode bayar', 'cara bayar', 'pembayaran', 'qris', 'gopay', 'dana', 'bca', 'bri', 'bni', 'mandiri', 'transfer'],
        secondaryKeywords: ['e-wallet', 'biaya admin', 'cara transfer', 'scan', 'virtual account'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! ZenithPrime menyediakan beragam metode pembayaran resmi, cepat, dan aman melalui **Midtrans**:

💳 **Pilihan Saluran Pembayaran:**
• **QRIS (Instan & Otomatis 24 Jam):** Mendukung scan dari **semua aplikasi perbankan (BCA, Mandiri, BRI, BNI, Danamon, CIMB)** dan **semua E-Wallet (GoPay, DANA, OVO, ShopeePay, LinkAja)**.
• **Virtual Account (VA):** Bank BCA, Mandiri, BNI, BRI, Permata Bank.
• **Direct E-Wallet:** GoPay & DANA langsung.

⏱️ **Panduan Singkat:**
Setiap pesanan memiliki batas waktu pembayaran **15 menit**. Pastikan Anda menyelesaikan transfer sebelum waktu habis agar pesanan tidak dibatalkan otomatis oleh sistem gateway!`,

            (userName) => `Metode pembayaran di ZenithPrime sangat lengkap Kak **${userName}**!
Anda dapat memilih:
1. **QRIS** (Praktis, langsung scan pakai aplikasi m-banking atau e-wallet apapun).
2. **Transfer Virtual Account Bank**.
3. **E-Wallet GoPay / DANA**.

Pembayaran diverifikasi secara otomatis dalam hitungan detik tanpa perlu konfirmasi manual!`
        ],
        quickReplies: ['Panduan Bayar QRIS', 'Virtual Account Bank', 'Katalog Game']
    },

    {
        id: 'INTENT_QRIS_TROUBLE',
        primaryKeywords: ['tidak bisa scan qris', 'qris buram', 'qris gagal', 'error scan qris', 'qris expired', 'gagal scan qris'],
        secondaryKeywords: ['cara scan', 'screenshot qris', 'waktu qris habis'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Berikut tips jika Anda mengalami kendala saat **Scan QRIS**:

📸 **Tips Pembayaran QRIS yang Berhasil:**
1. **Gunakan Fitur Upload Galeri:** Screenshot kode QRIS di layar checkout dengan resolusi penuh (jangan di-crop terlalu sempit), lalu buka aplikasi m-banking/e-wallet Anda dan pilih opsi **"Scan dari Galeri / Gambar"**.
2. **Periksa Waktu Berlaku:** Kode QRIS hanya aktif selama **15 menit**. Jika waktu sudah habis, jangan bayar ke QR tersebut! Silakan kembali ke katalog dan buat pesanan baru.
3. **Periksa Limit Harian:** Pastikan limit transaksi harian QRIS di aplikasi e-wallet Anda masih mencukupi.
4. **Nama Merchant:** Pastikan nama merchant yang muncul di layar konfirmasi adalah **ZenithPrime / Midtrans**.`,

            (userName) => `Kak **${userName}**, bila scan QRIS gagal terbaca:
• Simpan screenshot QRIS dengan kualitas jernih tanpa bayangan.
• Gunakan aplikasi e-wallet lain jika aplikasi pertama sedang gangguan.
• Bila masa berlaku 15 menit sudah lewat, buat pesanan baru di [Katalog Game](/games).`
        ],
        quickReplies: ['Katalog Game', 'Metode Pembayaran', 'Hubungi Staf']
    },

    {
        id: 'INTENT_VIRTUAL_ACCOUNT',
        primaryKeywords: ['virtual account', 'cara bayar va', 'nomor va', 'va bca', 'va mandiri', 'va bni', 'va bri'],
        secondaryKeywords: ['nomor rekening tidak ada', 'cara transfer va', 'va expired'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! Panduan pembayaran melalui **Virtual Account (VA)** Bank:

🏦 **Langkah Pembayaran VA:**
1. Pilih bank Anda (BCA, Mandiri, BNI, BRI) di halaman checkout.
2. Salin **Nomor Virtual Account** yang tertera di layar.
3. Buka M-Banking / ATM Anda, pilih menu **Transfer > Virtual Account** (bukan transfer rekening biasa).
4. Masukkan nomor VA tersebut. Total nominal tagihan akan muncul secara otomatis dan tepat.
5. Konfirmasi pembayaran dan transaksi Anda akan terverifikasi secara instan dalam 1–2 menit!

⚠️ **Catatan:** Nomor VA unik per transaksi dan kedaluwarsa setelah 15 menit.`
        ],
        quickReplies: ['Metode Pembayaran', 'Katalog Game', 'Riwayat Transaksi']
    },

    {
        id: 'INTENT_BIAYA_ADMIN',
        primaryKeywords: ['biaya admin', 'kenapa ada biaya', 'kena admin berapa', 'ada potongan admin', 'ppn', 'pajak'],
        secondaryKeywords: ['biaya qris', 'biaya va', 'rincian harga'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Mengenai **Biaya Layanan & Administrasi Pembayaran**:

📊 **Transparansi Rincian Biaya:**
• **Harga Diamond:** Harga item murni langsung dari distributor publisher resmi.
• **Biaya Payment Gateway:** Biaya pemrosesan transaksi yang ditetapkan oleh penyedia gerbang pembayaran (misal: tarif QRIS MDR resmi Bank Indonesia 0.7%, atau biaya switching perbankan VA).

💡 Seluruh rincian biaya dijabarkan secara transparan di rincian tagihan sebelum Anda mengonfirmasi pembayaran, tanpa ada biaya siluman tersembunyi!`
        ],
        quickReplies: ['Metode Pembayaran', 'Katalog Game', 'Info Promo Voucher']
    },

    {
        id: 'INTENT_BANK_CUTOFF',
        primaryKeywords: ['bank offline', 'cutoff bank', 'bca gangguan', 'bri gangguan malam', 'maintenance bank'],
        secondaryKeywords: ['tengah malam', 'kliring bank', 'jam operasional bank'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Informasi jadwal **Kliring & Cut-Off Perbankan**:

⏰ **Jadwal Pemeliharaan Bank:**
Beberapa perbankan (khususnya BCA, BRI, dan Mandiri) secara rutin melakukan pemeliharaan server harian (*daily cut-off*) antara pukul **23:00 s/d 02:00 WIB**. Pada rentang waktu ini, proses transfer manual VA terkadang mengalami penundaan sinkronisasi.

💡 **Rekomendasi Terbaik:**
Gunakan metode **QRIS** saat bertransaksi di tengah malam, karena jaringan QRIS memiliki stabilitas uptime yang jauh lebih tinggi dan jarang terpengaruh jadwal cut-off bank lokal!`
        ],
        quickReplies: ['Cara Bayar QRIS', 'Metode Pembayaran', 'Katalog Game']
    },

    // =====================================================================
    // PILAR 4: KEBIJAKAN PENGEMBALIAN DANA (REFUND POLICY)
    // =====================================================================
    {
        id: 'INTENT_REFUND_POLICY',
        primaryKeywords: ['refund', 'kembalikan uang', 'batal pesanan', 'retur', 'ganti rugi', 'kembali dana', 'batalkan'],
        secondaryKeywords: ['syarat refund', 'uang kembali', 'gagal', 'bisa refund', 'aturan refund'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! Rangkuman resmi **Kebijakan Pengembalian Dana (Refund Policy)** ZenithPrime:

📋 **Kondisi yang Berhak Menerima Refund Penuh (100%):**
1. **Kegagalan Sistem / Out of Stock:** Sistem gagal memproses item game dalam batas toleransi dan stok distributor resmi sedang bermasalah permanen.
2. **Transaksi Ganda (*Double Charge*):** Saldo Anda terpotong dua kali untuk satu pesanan yang sama.
3. **Pembayaran Kedaluwarsa (*Expired Paid*):** Anda mentransfer tagihan yang sudah kedaluwarsa dan item tidak dapat dikirimkan otomatis.

🚫 **Kondisi yang TIDAK BISA Direfund:**
1. **Kesalahan Pembeli:** Kesalahan input User ID/Zone ID yang menyebabkan diamond terkirim ke akun orang lain.
2. **Pesanan Sudah Sukses:** Diamond telah berhasil masuk ke akun game sesuai data checkout.

💳 **Pencairan:** Diproses oleh tim Finance dalam 1x24 jam kerja ke rekening/e-wallet Anda. Ketik **#staf** untuk mengajukan komplain refund.`,

            (userName) => `Kak **${userName}**, refund di ZenithPrime dijamin penuh jika:
• Transaksi dinyatakan **FAILED** namun saldo Anda sudah terpotong.
• Terjadi kendala teknis pada server provider yang tidak dapat diselesaikan.

Hubungi tim kami dengan mengetik **#staf** dan sertakan nomor invoice serta mutasi transfer Anda!`
        ],
        quickReplies: ['Hubungi Staf untuk Refund', 'Cek Nomor Pesanan', 'Syarat & Ketentuan']
    },

    {
        id: 'INTENT_REFUND_TIDAK_BISA',
        primaryKeywords: ['salah beli refund', 'berubah pikiran refund', 'salah nominal balikin uang', 'salah diamond refund'],
        secondaryKeywords: ['tidak bisa refund', 'kenapa gak bisa refund'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**, kami memahami situasi Anda. 🙏

⚠️ **Aturan Hukum Barang Digital:**
Sesuai Ketentuan Transaksi Produk Digital dan Kebijakan Publisher Game (Moonton, Garena, dll.):
• Apabila diamond/voucher sudah **berhasil disuntikkan ke akun game tujuan** sesuai pesanan Anda, transaksi tersebut bersifat **FINAL & NON-REFUNDABLE**.
• Sistem API developer game tidak menyediakan fitur penarikan kembali item yang telah sukses diterima oleh akun game.

Oleh karena itu, pastikan selalu memeriksa nominal item dan nomor ID game Anda sebelum melakukan pembayaran final.`
        ],
        quickReplies: ['Kebijakan Refund Lengkap', 'Hubungi Staf', 'Katalog Game']
    },

    {
        id: 'INTENT_REFUND_SLA_PROSEDUR',
        primaryKeywords: ['berapa lama refund', 'kapan uang masuk refund', 'estimasi refund', 'proses refund berapa lama', 'cara minta refund'],
        secondaryKeywords: ['prosedur refund', 'syarat pengajuan refund', 'format refund'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! Informasi **Prosedur & Waktu Pencairan Refund**:

⏱️ **Estimasi Waktu Pencairan (SLA):**
• Verifikasi berkas & pengecekan mutasi: **1 s/d 3 jam kerja**.
• Pengembalian dana ke rekening/e-wallet Anda: **Maksimal 1x24 jam kerja**.

📝 **Format Resmi Pengajuan Refund:**
Ketik **#staf** di chat ini dan kirimkan data berikut:
1. **Nomor Pesanan:** \`TRX-...\`
2. **Bukti Transfer / Mutasi Rekening** (screenshot jelas)
3. **Rekening Pengembalian:** Nama Bank / E-Wallet, Nomor Rekening, dan Nama Pemilik Akun.

Tim Finance kami akan langsung menindaklanjuti pengajuan Anda!`
        ],
        quickReplies: ['Hubungi Staf untuk Refund', 'Cek Nomor Pesanan']
    },

    // =====================================================================
    // PILAR 5: EVENT GAME, VOUCHER & PRODUK
    // =====================================================================
    {
        id: 'INTENT_EVENT_TOPUP_BONUS',
        primaryKeywords: ['event gak nambah', 'misi top up gak kehitung', 'quest top up belum masuk', 'event diamond gak nambah', 'event top up', 'misi top up', 'quest event'],
        secondaryKeywords: ['kof', 'all star', 'suprise box', 'event ml', 'event ff', 'misi event', 'event diamond'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Mengenai misi **Event Top-Up Game** (misal: Event MLBB / Free Fire):

💎 **Semua Diamond di ZenithPrime 100% Memvalidasi Event:**
• Diamond yang kami kirimkan adalah diamond resmi publisher sehingga secara mutlak **dihitung pada quest event top up**.

🔍 **Langkah Solusi Jika Misi Belum Bertambah:**
1. **Restart Game:** Tutup aplikasi game secara penuh (*force close*) lalu buka kembali untuk menyinkronkan event in-game.
2. **Klaim Manual di Tab Event:** Buka menu Event game ➔ pilih sub-menu Top-Up Quest ➔ klik tombol "Klaim / Claim".
3. **Cek Nominal Diamond Dasar:** Beberapa event publisher hanya menghitung nominal diamond dasar (*base diamond*), tidak menghitung diamond bonus promo bawaan game.`
        ],
        quickReplies: ['Katalog Game', 'Cek Nomor Pesanan', 'Hubungi Staf']
    },

    {
        id: 'INTENT_WEEKLY_PASS_RULES',
        primaryKeywords: ['weekly pass max', 'weekly pass berapa kali', 'wdp max berapa hari', 'weekly diamond pass batas'],
        secondaryKeywords: ['akumulasi weekly', 'beli weekly 2x', 'wdp mlbb'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Aturan resmi pembelian **Weekly Diamond Pass (WDP) MLBB**:

📅 **Batas Maksimal Akumulasi Durasi:**
• Sesuai aturan resmi Moonton, Weekly Diamond Pass dapat dibeli dan diakumulasikan maksimal hingga **70 HARI (10x Pembelian)**.
• Jika durasi WDP di akun Anda saat ini sudah mencapai **70 hari atau lebih**, sistem Moonton akan **menolak transaksi baru secara otomatis**.

💡 **Saran:**
Pastikan sisa durasi WDP akun Anda kurang dari 70 hari sebelum melakukan pembelian baru agar pesanan langsung sukses terkirim!`
        ],
        quickReplies: ['Katalog Game', 'Cara Top Up', 'Hubungi Staf']
    },

    {
        id: 'INTENT_PROMO_VOUCHER',
        primaryKeywords: ['voucher', 'kode promo', 'diskon', 'kupon', 'kode voucher', 'potongan harga', 'promo'],
        secondaryKeywords: ['cara pakai', 'klaim voucher', 'hemat', 'event promo', 'voucher tidak bisa'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! Mau top up lebih hemat menggunakan **Kode Voucher Promo**?

🎟️ **Panduan Penggunaan Kupon:**
1. Masuk ke halaman produk game pilihan Anda di [Katalog Game](/games).
2. Pilih nominal item diamond yang ingin Anda beli.
3. Pada bagian bawah sebelum checkout, terdapat kolom **"Punya Kode Promo?"**.
4. Ketikkan kode voucher (huruf kapital) lalu klik tombol **"Terapkan"**.
5. Total harga tagihan akan langsung terpotong secara otomatis!

⚠️ **Jika Voucher Gagal Digunakan:**
• Pastikan nilai belanja Anda memenuhi batas minimal transaksi voucher.
• Kuota harian voucher mungkin sudah habis terpakai oleh pengguna lain.`
        ],
        quickReplies: ['Katalog Game', 'Cara Top Up', 'Bantuan Lainnya']
    },

    {
        id: 'INTENT_REQUEST_NEW_GAME',
        primaryKeywords: ['request game', 'tambah game', 'ada game ini gak', 'kapan ada game', 'mau game baru'],
        secondaryKeywords: ['game lain', 'katalog baru'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! 🎮 Terima kasih atas saran dan antusiasmenya!

Daftar game yang saat ini aktif dapat dilihat di [Katalog Game Resmi](/games). Tim Produk ZenithPrime terus melakukan integrasi API untuk menambahkan game-game terbaru setiap bulannya.

Silakan sebutkan nama game yang ingin Anda hadirkan di ZenithPrime, dan saran Anda akan langsung kami catat untuk diajukan ke tim pengembang!`
        ],
        quickReplies: ['Katalog Game', 'Panduan Cara Top Up', 'Hubungi Staf']
    },

    // =====================================================================
    // PILAR 6: KEAMANAN, LEGALITAS & ANTI-FRAUD
    // =====================================================================
    {
        id: 'INTENT_LEGALITAS_KEAMANAN',
        primaryKeywords: ['legal', 'aman', 'resmi', 'anti banned', 'anti minus', 'carding', 'terpercaya', 'penipuan'],
        secondaryKeywords: ['100% legal', 'publisher', 'garansi', 'aman gak', 'diamond merah'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! Keamanan akun game Anda adalah jaminan prioritas mutlak kami di ZenithPrime:

🛡️ **100% Legal & Bebas Risiko Banned:**
• Seluruh item (Diamond MLBB, UC PUBG, VP Valorant, Genesis Crystal) disuntikkan langsung melalui jalur distributor resmi berlisensi publisher game (Moonton, Garena, Tencent, Riot Games).
• ZenithPrime **TIDAK PERNAH** menggunakan metode carding, refund ilegal, atau peretasan yang membahayakan akun pengguna.
• Akun game Anda dijamin **Bebas Diamond Minus / Merah** dan garansi 100% aman seumur hidup.

🔒 **Privasi Terjamin:**
Transaksi hanya memerlukan **User ID dan Server/Zone ID**. Kami tidak pernah meminta password akun Anda!`,

            (userName) => `Kak **${userName}**, ZenithPrime adalah platform top up terpercaya dan resmi:
1. **Tanpa Password Akun:** Cukup User ID game, jadi akun Anda tidak berisiko di-hack.
2. **Jalur Resmi Distributor:** Diamond masuk secara sah dari server publisher, bebas dari ancaman banned.
3. **Invoice Resmi:** Semua transaksi tercatat dengan invoice sah yang dapat dipertanggungjawabkan.`
        ],
        quickReplies: ['Katalog Game', 'Cara Top Up', 'Riwayat Transaksi']
    },

    {
        id: 'INTENT_NO_PASSWORD_POLICY',
        primaryKeywords: ['minta password', 'minta sandi', 'login akun gak', 'perlu sandi moonton', 'pakai password', 'butuh email akun', 'minta password moonton', 'butuh password'],
        secondaryKeywords: ['aman akun', 'jebol akun', 'moonton', 'keamanan akun'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! 🔒 **ZenithPrime TIDAK PERNAH Meminta Password Akun Game Anda!**

• Sistem kami menggunakan metode **Direct In-App Top-Up** resmi yang hanya membutuhkan **User ID dan Server/Zone ID**.
• Waspadalah terhadap oknum yang mengatasnamakan ZenithPrime dan meminta password, PIN, atau kode OTP email/Moonton Anda. Jangan pernah memberikan data sensitif tersebut kepada siapapun!`
        ],
        quickReplies: ['Katalog Game', 'Keamanan & Legalitas', 'Hubungi Staf']
    },

    {
        id: 'INTENT_WASPADA_PENIPUAN',
        primaryKeywords: ['wa admin', 'nomor wa cs', 'telegram zenith', 'admin minta pulsa', 'penipuan atas nama zenith', 'cs palsu'],
        secondaryKeywords: ['waspada scam', 'kontak resmi'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! ⚠️ **Peringatan Waspada Penipuan Mengatasnamakan ZenithPrime:**

1. Staf resmi ZenithPrime **TIDAK PERNAH** menghubungi Anda terlebih dahulu melalui WhatsApp/Telegram pribadi untuk meminta transfer ke rekening atas nama perorangan.
2. Seluruh transaksi resmi **HANYA** dilakukan melalui website resmi **ZenithPrime** dengan pembayaran via Midtrans.
3. Saluran bantuan Customer Service resmi hanya tersedia melalui widget **Live Chat** di website ini.`
        ],
        quickReplies: ['Keamanan & Legalitas', 'Bicara dengan Staf', 'Katalog Game']
    },

    {
        id: 'INTENT_PRIVASI_DATA',
        primaryKeywords: ['keamanan data', 'kebijakan privasi', 'data bocor', 'privasi pengguna', 'data pribadi aman'],
        secondaryKeywords: ['enkripsi', 'ssl'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! Privasi dan perlindungan data pengguna adalah komitmen utama kami:

🔐 **Standar Keamanan ZenithPrime:**
• Transmisi data Anda dilindungi oleh protokol enkripsi **SSL/TLS 256-bit**.
• Kata sandi akun Anda dienkripsi menggunakan algoritma **Bcrypt** berstandar industri sehingga tidak dapat dibaca oleh siapapun.
• Informasi pembayaran diproses secara aman oleh gateway berlisensi Bank Indonesia (Midtrans).

Silakan pelajari selengkapnya di halaman [Kebijakan Privasi](/privacy).`
        ],
        quickReplies: ['Kebijakan Privasi', 'Keamanan & Legalitas', 'Bantuan Akun']
    },

    {
        id: 'INTENT_JAM_OPERASIONAL',
        primaryKeywords: ['jam kerja', 'jam buka', 'operasional', 'buka jam berapa', 'tutup jam berapa', 'kapan dilayani'],
        secondaryKeywords: ['online', '24 jam', 'jadwal cs'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! ⏰ **Layanan ZenithPrime Beroperasi 24 Jam Nonstop!**

• **Sistem Top Up & Pembayaran Otomatis:** Aktif 24 jam sehari, 7 hari seminggu tanpa libur. Anda bisa melakukan transaksi tengah malam sekalipun.
• **Customer Service & AI Assistant:** Selalu siaga 24/7 untuk menjawab pertanyaan dan membantu kendala Anda.`,

            (userName) => `ZenithPrime beroperasi **24/7 (24 Jam Penuh)** Kak **${userName}**!
Pengiriman diamond diproses oleh server otomatis sehingga pesanan tengah malam pun akan langsung terkirim dalam hitungan menit.`
        ],
        quickReplies: ['Katalog Game', 'Cara Top Up', 'Hubungi Staf']
    },

    // =====================================================================
    // PILAR 7: MANAJEMEN AKUN & AUTENTIKASI PENGGUNA
    // =====================================================================
    {
        id: 'INTENT_RESET_PASSWORD',
        primaryKeywords: ['lupa password', 'lupa sandi', 'reset password', 'ganti password', 'ubah sandi', 'tidak bisa login'],
        secondaryKeywords: ['email', 'token', 'akun', 'link reset'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! Jika Anda lupa kata sandi akun ZenithPrime Anda:

🔐 **Langkah Reset Password Mandiri:**
1. Kunjungi halaman resmi [Lupa Password](/auth/forgot-password).
2. Masukkan alamat email yang terdaftar pada akun ZenithPrime Anda.
3. Klik tombol **Kirim Link Reset**.
4. Periksa kotak masuk (*Inbox*) atau folder *Spam* email Anda untuk menemukan link pembaruan sandi.
5. Buat kata sandi baru yang kuat (minimal 6 karakter) dan simpan.

*Catatan: Tautan reset password berlaku selama 1 jam demi keamanan akun Anda.*`,

            (userName) => `Jangan khawatir Kak **${userName}**, Anda dapat memperbarui kata sandi akun kapan saja melalui tautan resmi:
👉 **[Halaman Lupa Password](/auth/forgot-password)**

Cukup ketik email Anda, dan sistem kami akan mengirimkan link untuk membuat kata sandi baru yang aman.`
        ],
        quickReplies: ['Buka Halaman Lupa Password', 'Masuk ke Akun', 'Bantuan Akun']
    },

    {
        id: 'INTENT_EMAIL_NOT_RECEIVED',
        primaryKeywords: ['email gak masuk', 'belum terima email reset', 'link reset gak ada', 'email verifikasi tidak ada'],
        secondaryKeywords: ['cek spam', 'kirim ulang email'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Bila email reset password belum masuk ke kotak masuk Anda:

📬 **Langkah Pengecekan:**
1. **Cek Folder Spam / Junk / Promotions:** Terkadang filter email mengarahkan pesan otomatis ke folder tersebut.
2. **Periksa Ejaan Email:** Pastikan tidak ada salah ketik huruf pada alamat email saat memasukkannya di form lupa password.
3. **Tunggu 2–3 Menit:** Antrean server email terkadang membutuhkan sedikit waktu. Jika masih belum tiba, lakukan permintaan reset ulang di [Lupa Password](/auth/forgot-password).`
        ],
        quickReplies: ['Halaman Lupa Password', 'Hubungi Staf', 'Bantuan Akun']
    },

    {
        id: 'INTENT_RATE_LIMIT_LOGIN',
        primaryKeywords: ['terlalu banyak percobaan', 'rate limit login', 'akun terkunci', 'diblokir login', 'terlalu sering login'],
        secondaryKeywords: ['tunggu berapa menit', 'brute force'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Mengenai notifikasi **"Terlalu Banyak Percobaan Login"**:

🛡️ **Proteksi Keamanan Anti-Brute Force:**
Sistem keamanan ZenithPrime secara otomatis membatasi percobaan masuk jika terjadi kegagalan password berulang kali demi melindungi akun Anda dari upaya peretasan pihak asing.

⏳ **Solusi:**
Silakan tunggu selama **15 menit**. Sistem akan membuka kunci sementara secara otomatis. Atau jika Anda lupa sandi, gunakan fitur [Lupa Password](/auth/forgot-password) untuk langsung masuk dengan sandi baru!`
        ],
        quickReplies: ['Halaman Lupa Password', 'Bantuan Akun', 'Hubungi Staf']
    },

    {
        id: 'INTENT_BENEFIT_MEMBER',
        primaryKeywords: ['keuntungan daftar akun', 'kenapa harus daftar', 'beda member sama guest', 'manfaat punya akun'],
        secondaryKeywords: ['daftar member', 'poin member'],
        threshold: 2.5,
        options: [
            (userName) => `Halo **${userName}**! 🌟 **Keuntungan Mendaftar Akun di ZenithPrime:**

1. **Riwayat Transaksi Tersimpan Rapi:** Anda dapat memantau status pesanan, invoice, dan riwayat top up Anda kapan saja di [Riwayat Transaksi](/history).
2. **Promo & Voucher Spesial:** Akses ke kode diskon eksklusif khusus pengguna terdaftar.
3. **Proses Checkout Kilat:** Data akun tersimpan aman sehingga checkout jauh lebih cepat tanpa mengisi ulang identitas.

Tunggu apa lagi? Daftarkan akun Anda gratis hanya dalam 30 detik di [Daftar Akun Baru](/auth/register)!`
        ],
        quickReplies: ['Daftar Akun Baru', 'Katalog Game', 'Info Promo Voucher']
    },

    // =====================================================================
    // PILAR 8: SISTEM, TEKNIS & ESKALASI STAF
    // =====================================================================
    {
        id: 'INTENT_WEB_ERROR_TECHNICAL',
        primaryKeywords: ['web error', 'loading terus', 'tombol bayar gak bisa diklik', 'halaman error', 'error 500', 'blank putih'],
        secondaryKeywords: ['troubleshoot', 'refresh', 'kendala web'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**! Jika Anda mengalami kendala teknis pada tampilan website:

🛠️ **Solusi Praktis Mengatasi Kendala Tampilan:**
1. **Bersihkan Cache Browser:** Bersihkan cache & cookie pada browser Anda, atau coba buka website melalui mode **Incognito / Private Window**.
2. **Nonaktifkan AdBlocker:** Beberapa ekstensi pemblokir iklan dapat mengganggu script popup pembayaran Midtrans Snap.
3. **Ganti Browser:** Gunakan peramban Google Chrome atau Safari versi terbaru untuk pengalaman optimal.

Jika kendala tetap berlanjut, ketik **#staf** agar tim IT kami dapat membantu memeriksa sesi Anda!`
        ],
        quickReplies: ['Katalog Game', 'Bicara dengan Staf', 'Cara Top Up']
    },

    {
        id: 'INTENT_TOXIC_DEESCALATION',
        primaryKeywords: ['anjing', 'babi', 'bangsat', 'tai', 'penipu', 'kontol', 'goblok', 'tolol', 'bajingan', 'kampret'],
        secondaryKeywords: ['kecewa', 'marah', 'rugi'],
        threshold: 2.0,
        options: [
            (userName) => `Halo Kak **${userName}**, kami memohon maaf sebesar-besarnya atas ketidaknyamanan yang Anda alami. 🙏 Kami sangat memahami kekecewaan Anda apabila terjadi kendala pada pesanan Anda.

ZenithPrime berkomitmen menyelesaikan setiap permasalahan dengan tuntas dan bertanggung jawab penuh. Kami siap membantu Anda detik ini juga.

Mohon berikan **Nomor Order** Anda (\`TRX-...\`) atau ketik **#staf** agar keluhan Anda langsung ditangani secara prioritas oleh Supervisor Customer Support kami. Terima kasih atas kerja samanya!`
        ],
        quickReplies: ['Hubungi Staf Sekarang', 'Cek Nomor Pesanan', 'Kebijakan Refund'],
        escalate: true
    },

    {
        id: 'INTENT_ESKALASI_MANUSIA',
        primaryKeywords: ['staf_manusia', 'bicara dengan staf', 'admin asli', 'cs manusia', 'hubungi staf', 'orang asli', 'petugas', '#staf', '#cs'],
        secondaryKeywords: ['komplain manual', 'tolong staf', 'panggil admin'],
        threshold: 2.0,
        options: [
            (userName) => `Baik Kak **${userName}**! 🔔 **Permintaan Bantuan Staf Manusia Diterima.**

Tiket obrolan Anda telah diprioritaskan dan diteruskan ke **Staff Workspace Customer Service** kami. Staf manusia kami yang sedang bertugas akan segera mengambil alih obrolan ini dalam hitungan menit.

Mohon siapkan informasi berikut agar dapat ditangani lebih cepat:
1. **Nomor Invoice / Order ID** (contoh: \`TRX-...\`)
2. **Bukti Transfer / Mutasi** (jika ada kendala pembayaran)
3. **Penjelasan singkat kendala yang dialami**

*Staf kami akan segera membalas di jendela chat ini. Terima kasih atas kesabaran Anda!*`
        ],
        quickReplies: ['Cek Nomor Pesanan', 'Kebijakan Refund', 'Lihat Riwayat Transaksi'],
        escalate: true
    },

    {
        id: 'INTENT_GREETING',
        primaryKeywords: ['halo', 'hai', 'hello', 'hi', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum', 'pagi', 'siang', 'malam'],
        secondaryKeywords: ['bisa bantu', 'mau tanya'],
        threshold: 1.5,
        options: [
            (userName) => `Halo **${userName}**! 👋 Selamat datang di **Customer Support ZenithPrime**.

Saya adalah **Zenith AI**, asisten pintar yang siap mendampingi Anda 24/7. Ada kendala atau pertanyaan yang bisa saya bantu? 
Misalnya seputar:
• 🔍 Cek status pesanan terkini (Ketik nomor order \`TRX-...\`)
• ⚡ Kendala pesanan pending atau saldo terpotong
• 💳 Panduan pembayaran QRIS & E-Wallet
• 📜 Syarat & pengajuan refund pengembalian dana
• 👨‍💼 Menghubungkan Anda ke CS Staf Manusia`,

            (userName) => `Hai Kak **${userName}**! 🎮 Ada yang bisa saya bantu seputar transaksi atau layanan ZenithPrime hari ini? 
Silakan ketikkan kendala Anda secara leluasa atau pilih opsi bantuan cepat di bawah!`
        ],
        quickReplies: ['Cek Status Pesanan', 'Panduan Top Up', 'Kebijakan Refund', 'Bicara dengan Staf']
    },

    {
        id: 'INTENT_JOKI_INFO',
        primaryKeywords: ['joki', 'joki rank', 'jasa joki', 'booster', 'boosting', 'paket joki', 'gb wr', 'joki ml', 'joki valo', 'joki ff', 'joki hok', 'joki genshin', 'bintang joki', 'request joki', 'joki request', 'mabar duo', 'mabar joki', 'kalkulator joki', 'custom joki'],
        secondaryKeywords: ['harga joki', 'berapa lama joki', 'estimasi', 'bintang', 'tier', 'rank', 'tanpa password', 'party mode', 'request bebas'],
        threshold: 2.0,
        options: [
            (userName) => `Halo Kak **${userName}**! 🛡️ Layanan **Jasa Joki Game ZenithPrime** menggunakan sistem **FLEKSIBEL PER-REQUEST** (bukan sekadar paket kaku)!
            
🎮 **4 Mode Request Joki yang Tersedia:**
1. ⚡ **Kalkulator Push Rank Dinamis:** Pilih rank awal Anda saat ini ➔ pilih target impian Anda. Jarak bintang/tier, estimasi waktu, & total harga dihitung otomatis secara instan!
2. 👥 **Joki Mabar Duo (Party Mode):** Mau push rank tapi ragu kasih akun? Pilih mode Mabar Party! Anda main bareng (duo/trio) dengan Pro Booster kami **100% TANPA PERLU KASIH PASSWORD**.
3. 🎯 **GB Winrate / Match Hero:** Push winrate atau mastery hero tertentu dengan jumlah match yang Anda tentukan sendiri.
4. 📝 **Custom Request Bebas:** Butuh quest khusus, clear Spiral Abyss Genshin Impact 36 Bintang, eksplorasi map, atau kebutuhan spesifik lainnya? Semua bisa diajukan sesuai request Anda!

⚡ **Keunggulan Joki ZenithPrime:**
• Pro Booster Terverifikasi (Tier Immortal / Radiant).
• 100% Anti-Minus & Garansi Aman.
• Live Progress Tracking real-time di web & bukti screenshot kemenangan.

👉 Silakan coba kalkulator harga & buat pesanan di: [Katalog Jasa Joki ZenithPrime](/joki)`,

            (userName) => `Salam Gamers **${userName}**! 🏆 Di ZenithPrime, joki game dibuat **fleksibel per-request** sesuai kebutuhan akun Anda:
            
• Bisa hitung dari Rank Awal ke Target Rank (Kalkulator real-time).
• Bisa request **Mabar Duo Party** (aman tanpa perlu memberikan password akun).
• Bisa request hero tertentu atau custom quest (Abyss Genshin, BR/CS Free Fire).
• Pengerjaan kilat dengan pelacakan live progress di dashboard.

Yuk langsung tentukan request joki Anda di [Halaman Request Joki](/joki)!`
        ],
        quickReplies: ['Katalog Joki', 'Joki Tanpa Password', 'Keamanan Akun Joki']
    },

    {
        id: 'INTENT_JOKI_SECURITY',
        primaryKeywords: ['aman joki', 'keamanan joki', 'aman gak joki', 'apakah joki aman', 'banned joki', 'anti minus joki', 'otp joki', 'diamond kepake joki', 'joki tanpa password'],
        secondaryKeywords: ['akun dicuri', 'bobol', 'hack', 'privasi', 'moonton', 'riot', 'mabar duo', 'party'],
        threshold: 2.5,
        options: [
            (userName) => `Halo Kak **${userName}**, keamanan akun pelanggan adalah **prioritas #1** di ZenithPrime! 🔒🛡️

Berikut **SOP & Perlindungan Akun Joki**:
1. 👥 **Opsi Mabar Duo (100% Tanpa Password):** Jika Kakak tidak ingin membagikan data login, Kakak bisa memilih opsi **Joki Mabar Duo / Party Mode** saat memesan. Kakak cukup bermain bersama Pro Booster kami di dalam game tanpa menyerahkan email/password!
2. 🛡️ **Skill Murni 100%:** Penjoki kami dilarang keras memakai cheat, mod apk, script injector, atau aplikasi pihak ketiga terlarang.
3. 🔐 **Kerahasiaan Password:** Data login dienkripsi dan hanya dapat diakses oleh worker terverifikasi yang menangani order Anda.
4. 🚫 **No Diamond / Inventory Touching:** Worker dilarang keras menggunakan resource akun, diamond, hadiah tas, atau menghapus teman.
5. 📱 **Koordinasi OTP via WhatsApp:** Worker akan chat WhatsApp Anda dengan sopan untuk meminta kode verifikasi saat hendak mulai pengerjaan.
6. 📸 **Wajib Upload Screenshot Bukti:** Setelah target selesai, worker wajib mengupload foto bukti hasil kemenangan.

*Pesan sekarang dengan rasa tenang di [Katalog Jasa Joki](/joki) atau konsultasikan dengan staf kami!*`,
        ],
        quickReplies: ['Katalog Joki', 'Pesan Joki Sekarang', 'Bicara dengan Staf']
    },
    {
        id: 'INTENT_JOKI_MLBB_TIERS',
        primaryKeywords: ['tier ml', 'rank ml', 'tier mobile legends', 'rank mobile legends', 'daftar rank ml', 'daftar tier ml', 'tier list ml', 'tingkatan rank ml', 'urutan rank ml', 'urutan tier ml', 'warrior ke mythic', 'bintang ml', 'grading ml', 'placement ml', 'mythic honor', 'mythic glory', 'mythic immortal'],
        secondaryKeywords: ['bintang', 'tier', 'divisi', 'penempatan', 'kalkulator ml', 'honor', 'glory', 'immortal'],
        threshold: 2.0,
        options: [
            (userName) => `Halo Kak **${userName}**! 🏆 Berikut adalah **Tier List & Struktur Rank Mobile Legends** resmi yang didukung di sistem Joki Fleksibel ZenithPrime:

1. 🛡️ **Warrior (I–III):** Bintang 1–5 per divisi
2. ⚔️ **Elite (I–III):** Bintang 1–5 per divisi
3. 🎖️ **Master (I–IV):** Bintang 1–5 per divisi
4. 🏅 **GrandMaster (I–V):** Bintang 1–5 per divisi
5. 💎 **Epic (I–V):** Bintang 1–5 per divisi
6. 👑 **Legend (I–V):** Bintang 1–5 per divisi
7. 🌟 **Mythic Placement / Grading (Penempatan):** Bintang 1–10
8. 🔮 **Mythic:** Bintang 1–24
9. 💠 **Mythic Honor:** Bintang 25–49
10. 🔱 **Mythic Glory:** Bintang 50–99
11. 🔥 **Mythic Immortal:** Bintang 100+

💡 *Anda dapat memilih posisi rank awal dan target impian secara spesifik. Sistem akan otomatis menghitung selisih bintang dan biaya pengerjaannya secara real-time!*

👉 Hitung harga rank Anda sekarang di: [Kalkulator Joki Mobile Legends](/joki/mobile-legends)`,
        ],
        quickReplies: ['Kalkulator Joki ML', 'Joki Tanpa Password', 'Katalog Joki']
    },

    {
        id: 'INTENT_TERIMA_KASIH',
        primaryKeywords: ['terima kasih', 'makasih', 'thanks', 'thx', 'tengkyu', 'sukses', 'mantap', 'oke makasih', 'ok makasih', 'siap makasih', 'membantu'],
        secondaryKeywords: ['sangat membantu', 'paham', 'mengerti'],
        threshold: 2.0,
        options: [
            (userName) => `Sama-sama Kak **${userName}**! Senang sekali bisa membantu Anda. 😊 Selamat bermain game dan semoga harimu menyenangkan! Jika ada pertanyaan lain di kemudian hari, jangan ragu untuk kembali chat ke sini ya. Salam Gamers! 🚀🎮`,
            (userName) => `Terima kasih kembali Kak **${userName}**! 🙏 Sukses selalu untuk rank dan permainannya. ZenithPrime selalu siap melayani kebutuhan top up Anda 24 jam nonstop!`
        ],
        quickReplies: ['Katalog Game', 'Riwayat Transaksi']
    }
];

// Fallback cerdas jika tidak ada intent yang cocok
const FALLBACK_OPTIONS = [
    (userName) => `Halo **${userName}**, saya Zenith AI Assistant. 😊 

Pertanyaan Anda belum sepenuhnya saya temukan padanannya dalam sistem. Namun, saya siap membantu untuk topik-topik populer berikut:

📌 **Panduan Kasus yang Sering Ditanyakan:**
1. **Status Pesanan:** Ketik langsung nomor invoice Anda (contoh: \`TRX-1768...\`).
2. **Saldo Terpotong:** Uang sudah berkurang namun diamond belum masuk.
3. **Salah Input ID:** Penanganan salah ketik User ID / Zone ID game.
4. **Pembayaran QRIS & VA:** Panduan cara bayar via semua bank & e-wallet.
5. **Kebijakan Refund:** Syarat pengembalian dana resmi ZenithPrime.

*Ingin berbicara langsung dengan tim kami? Cukup ketik **#staf** atau klik tombol di bawah untuk terhubung ke CS manusia kami!*`,

    (userName) => `Mohon maaf Kak **${userName}**, bisakah Anda menjelaskan kendalanya dengan kata kunci yang lebih spesifik?

Contoh:
• *"Kenapa pesanan saya pending?"*
• *"Saldo sudah terpotong tapi diamond belum nambah"*
• *"Cek order TRX-1768..."*
• Atau ketik **#staf** jika Anda ingin langsung dibantu oleh staf manusia kami.`
];

// =========================================================================
// 🧠 DETEKTOR & KLASIFIKASI KELUHAN OTOMATIS (SMART TRIAGE)
// =========================================================================
function analyzeComplaint(rawMessage, detectedOrderId = null, matchedIntentId = null) {
    const text = (rawMessage || '').trim();
    const normalized = normalizeText(text);

    let isComplaint = false;
    let category = 'GENERAL_QUERY';
    let urgency = 'low';
    let summary = 'Pertanyaan umum seputar layanan';

    const isExplicitStaff = text.includes('#staf') || text.includes('#cs') || 
        /(bicara|chat|hubungi|panggil|ngomong).*(staf|admin|manusia|cs|orang)/i.test(normalized) ||
        /(staf_manusia|admin asli|orang asli|cs manusia)/i.test(normalized) ||
        matchedIntentId === 'INTENT_ESKALASI_MANUSIA';

    const isPaymentIssue = /(saldo|duit|uang|rekening|mutasi).*(terpotong|kepotong|hilang|kurang|potong)/i.test(normalized) ||
        /(sudah|udh|sdh).*(transfer|bayar|tf).*belum masuk/i.test(normalized) ||
        /(gagal|batal|fail).*(saldo|duit|uang|bayar)/i.test(normalized) ||
        /(dobel|double|2x).*bayar/i.test(normalized) ||
        ['INTENT_SALDO_TERPOTONG', 'INTENT_ORDER_FAILED_PAID', 'INTENT_EXPIRED_PAYMENT', 'INTENT_DOUBLE_CHARGE'].includes(matchedIntentId);

    const isPendingIssue = /(pending|lama|lelet|gantung|delay|belum masuk|blm masuk|menunggu).*(diamond|dm|order|trx|item|pesanan|joki)/i.test(normalized) ||
        /(diamond|dm|order|item|pesanan).*(belum masuk|blm masuk|pending|lama|gak masuk)/i.test(normalized) ||
        matchedIntentId === 'INTENT_ORDER_PENDING';

    const isWrongId = /(salah|keliru|typo).*(id|server|zone|nomor|tujuan|user id)/i.test(normalized) ||
        matchedIntentId === 'INTENT_WRONG_ID_SERVER';

    const isJokiIssue = /(joki|booster|penjoki|worker).*(belum|pending|lama|afk|kalah|minus|batal|berhenti|jalan|mabar|rank|akun)/i.test(normalized) ||
        /(belum|lama|pending|kalah|minus).*(joki|booster|penjoki|worker)/i.test(normalized) ||
        (detectedOrderId && detectedOrderId.startsWith('JK-'));

    const isToxicOrFrustrated = /(kecewa|rugi|penipu|parah|bohong|tanggung jawab|ganti rugi|refund|balikin|komplain|lapor|tolong cepat)/i.test(normalized) ||
        matchedIntentId === 'INTENT_TOXIC_DEESCALATION';

    if (isPaymentIssue) {
        isComplaint = true;
        category = 'PAYMENT_ISSUE';
        urgency = isToxicOrFrustrated ? 'urgent' : 'high';
        summary = detectedOrderId 
            ? `Kendala Pembayaran: Saldo Terpotong (Order #${detectedOrderId})`
            : `Kendala Pembayaran: Saldo Terpotong / Mutasi`;
    } else if (isExplicitStaff) {
        isComplaint = true;
        category = 'HUMAN_ESCALATION';
        urgency = 'urgent';
        summary = detectedOrderId 
            ? `User Meminta Bantuan Staf Langsung (Order #${detectedOrderId})`
            : `User Meminta Bantuan Staf Langsung`;
    } else if (isWrongId) {
        isComplaint = true;
        category = 'WRONG_ID';
        urgency = 'high';
        summary = detectedOrderId 
            ? `Salah Input ID / Server Game (Order #${detectedOrderId})`
            : `Salah Input ID / Server Game`;
    } else if (isJokiIssue) {
        isComplaint = true;
        category = 'JOKI_ISSUE';
        urgency = 'high';
        summary = detectedOrderId 
            ? `Kendala Pengerjaan Joki Game (Order #${detectedOrderId})`
            : `Kendala Pengerjaan Joki Game`;
    } else if (isPendingIssue) {
        isComplaint = true;
        category = 'TRANSACTION_DELAY';
        urgency = isToxicOrFrustrated ? 'urgent' : 'medium';
        summary = detectedOrderId 
            ? `Pesanan Pending / Belum Masuk (Order #${detectedOrderId})`
            : `Pesanan Pending / Belum Masuk`;
    } else if (isToxicOrFrustrated) {
        isComplaint = true;
        category = 'GENERAL_COMPLAINT';
        urgency = 'urgent';
        summary = detectedOrderId 
            ? `Keluhan Pengguna: Meminta Solusi Segera (Order #${detectedOrderId})`
            : `Keluhan Pengguna: Meminta Solusi Segera`;
    } else if (detectedOrderId) {
        summary = `Pengecekan Status Order #${detectedOrderId}`;
    }

    return {
        isComplaint,
        category,
        urgency,
        summary,
        detectedOrderId
    };
}

// =========================================================================
// 🚀 MAIN ENGINE PROCESSING FUNCTION
// =========================================================================
async function processMessage(rawMessage, userContext = {}) {
    const userName = (userContext && userContext.name) ? userContext.name : 'Sobat Gamers';
    const normalized = normalizeText(rawMessage);
    const detectedOrderId = extractOrderId(rawMessage);

    // 1. Cek apakah ada bahasa kasar / toxic (Protokol De-eskalasi)
    const toxicIntent = INTENT_DEFINITIONS.find(i => i.id === 'INTENT_TOXIC_DEESCALATION');
    if (toxicIntent) {
        for (const kw of toxicIntent.primaryKeywords) {
            if (normalized.includes(kw)) {
                const respGen = pickOption(toxicIntent.options);
                const triage = analyzeComplaint(rawMessage, detectedOrderId, 'INTENT_TOXIC_DEESCALATION');
                return {
                    text: respGen(userName),
                    quickReplies: toxicIntent.quickReplies || [],
                    isEscalated: true,
                    triage
                };
            }
        }
    }

    // 2. Cek apakah pengguna secara eksplisit meminta eskalasi ke staf manusia
    if (
        rawMessage.includes('#staf') || 
        rawMessage.includes('#cs') || 
        /(bicara|chat|hubungi|panggil|ngomong).*(staf|admin|manusia|cs|orang)/i.test(normalized) ||
        /(staf_manusia|admin asli|orang asli|cs manusia)/i.test(normalized)
    ) {
        const escalationIntent = INTENT_DEFINITIONS.find(i => i.id === 'INTENT_ESKALASI_MANUSIA');
        if (escalationIntent) {
            const respGen = pickOption(escalationIntent.options);
            const triage = analyzeComplaint(rawMessage, detectedOrderId, 'INTENT_ESKALASI_MANUSIA');
            return {
                text: respGen(userName),
                quickReplies: escalationIntent.quickReplies || [],
                isEscalated: true,
                triage
            };
        }
    }

    // 3. Cek apakah ada Order ID / Invoice yang dikirimkan user (Live Database Lookup)
    if (detectedOrderId) {
        const orderData = await fetchOrderDetails(detectedOrderId);
        if (orderData) {
            const triage = analyzeComplaint(rawMessage, detectedOrderId, null);

            // Jika pesanan adalah Jasa Joki (JK-)
            if (orderData.is_joki) {
                const jokiStatusBadge = {
                    'unpaid': '⏳ MENUNGGU PEMBAYARAN',
                    'queued': '📥 DALAM ANTRIAN PENJOKI',
                    'in_progress': '🎮 SEDANG DIKERJAKAN WORKER',
                    'completed': '🏆 SELESAI PENUH (SUKSES)',
                    'canceled': '❌ DIBATALKAN'
                }[orderData.order_status] || orderData.order_status.toUpperCase();

                const jokiExplanation = {
                    'unpaid': 'Pesanan joki ini belum dibayar. Silakan lakukan pembayaran di menu checkout agar segera masuk ke antrian worker.',
                    'queued': 'Pembayaran telah sukses! Pesanan Anda saat ini berada di antrian prioritas dan segera diambil oleh pro booster kami.',
                    'in_progress': `Penjoki terverifikasi (${orderData.worker_name || 'Pro Booster'}) sedang mengerjakan akun Anda. Mohon tidak login ke dalam game selama proses joki berlangsung.`,
                    'completed': 'Target rank / bintang telah sukses tercapai! Bukti screenshot hasil kemenangan telah diupload oleh penjoki.',
                    'canceled': 'Pesanan joki ini telah dibatalkan.'
                }[orderData.order_status] || 'Pesanan sedang diproses.';

                const jokiResponse = `🔍 **Hasil Pengecekan Pesanan Joki Game Live:**

🛡️ **Detail Order Joki:**
• **Nomor Order:** \`${orderData.order_id}\`
• **Game:** ${orderData.game_name}
• **Tipe Request:** ${orderData.request_type || 'Push Rank'}${orderData.play_mode === 'party' ? ' *(🎮 Mode Mabar Party - Tanpa Password)*' : ''}
${orderData.current_rank && orderData.target_rank ? `• **Target Rank:** 🎯 ${orderData.current_rank} ➔ ${orderData.target_rank}\n` : ''}${orderData.request_hero ? `• **Request Hero:** 🦸 ${orderData.request_hero}\n` : ''}• **Deskripsi / Layanan:** ${orderData.product_name}
• **Metode Akses:** ${orderData.play_mode === 'party' ? 'Mabar Langsung In-Game' : (orderData.login_via || '-').toUpperCase()}
• **Total Biaya:** Rp ${Number(orderData.amount || 0).toLocaleString('id-ID')}
• **Status Pengerjaan:** **${jokiStatusBadge}**
• **Penjoki Bertugas:** ${orderData.worker_name ? `${orderData.worker_name} (Verified Booster)` : 'Sedang Menunggu Pengambilan'}
• **Waktu Order:** ${new Date(orderData.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB

ℹ️ **Keterangan:**
${jokiExplanation}

🔗 **Pantau Langsung:**
Klik untuk melihat live progress & download bukti rank: [Status Joki #${orderData.order_id}](/joki/status/${orderData.order_id})

*Butuh koordinasi login dengan penjoki? Ketik **#staf** untuk terhubung ke CS.*`;

                return {
                    text: jokiResponse,
                    quickReplies: ['Lihat Status Joki', 'Hubungi Staf Manusia'],
                    isEscalated: false,
                    triage
                };
            }

            // Pesanan Top Up Reguler
            const statusBadge = {
                'success': '✅ SUKSES / SELESAI',
                'pending': '⏳ PENDING (Menunggu Pembayaran / Proses Provider)',
                'failed': '❌ FAILED / DIBATALKAN',
                'expired': '⏰ EXPIRED (Kedaluwarsa)'
            }[orderData.status] || orderData.status.toUpperCase();

            let statusExplanation = '';
            if (orderData.status === 'success') {
                statusExplanation = 'Diamond / item telah sukses terkirim ke User ID tujuan dari server distributor resmi.';
            } else if (orderData.status === 'pending') {
                statusExplanation = 'Pesanan tercatat di sistem kami dan sedang menunggu verifikasi pembayaran Midtrans atau antrean API provider. Jika sudah bayar, mohon tunggu 1–5 menit.';
            } else if (orderData.status === 'expired') {
                statusExplanation = 'Batas waktu pembayaran 15 menit telah habis. Silakan buat pesanan baru di katalog game.';
            } else {
                statusExplanation = 'Pesanan ini dibatalkan atau mengalami kegagalan proses. Hubungi staf jika saldo Anda sempat terpotong.';
            }

            const targetDisplay = orderData.target_id 
                ? `${orderData.target_id}${orderData.zone_id ? ' (Zone ' + orderData.zone_id + ')' : ''}`
                : '-';

            const responseText = `🔍 **Hasil Pengecekan Nomor Pesanan Live:**

📦 **Detail Invoice:**
• **Nomor Order:** \`${orderData.order_id}\`
• **Game:** ${orderData.game_name}
• **Item:** ${orderData.product_name}
• **User ID Tujuan:** \`${targetDisplay}\`
• **Total Biaya:** Rp ${Number(orderData.amount || 0).toLocaleString('id-ID')}
• **Status Saat Ini:** **${statusBadge}**
• **Waktu Transaksi:** ${new Date(orderData.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB

ℹ️ **Keterangan:**
${statusExplanation}

*Butuh bantuan lebih lanjut untuk pesanan ini? Ketik **#staf** untuk terhubung ke staf Customer Service.*`;

            return {
                text: responseText,
                quickReplies: ['Cek Riwayat Lengkap', 'Hubungi Staf Manusia'],
                isEscalated: false,
                triage
            };
        }
    }

    // 4. Intent Scoring Engine (Multi-Word & Subword Matching)
    let bestIntent = null;
    let highestScore = 0;

    for (const intent of INTENT_DEFINITIONS) {
        let score = 0;

        // Cek Primary Keywords (Bobot tinggi: 3.0 per exact match, 2.5 per all-subwords match)
        for (const kw of intent.primaryKeywords) {
            if (normalized.includes(kw)) {
                score += 3.0;
            } else if (kw.includes(' ')) {
                const subwords = kw.split(' ');
                if (subwords.every(w => normalized.includes(w))) {
                    score += 2.5;
                }
            }
        }

        // Cek Secondary Keywords (Bobot pendukung: 1.5 per exact match, 1.0 per all-subwords match)
        for (const kw of intent.secondaryKeywords) {
            if (normalized.includes(kw)) {
                score += 1.5;
            } else if (kw.includes(' ')) {
                const subwords = kw.split(' ');
                if (subwords.every(w => normalized.includes(w))) {
                    score += 1.0;
                }
            }
        }

        if (score >= intent.threshold && score > highestScore) {
            highestScore = score;
            bestIntent = intent;
        }
    }

    // 5. Jika cocok dengan salah satu Intent
    if (bestIntent) {
        const responseGenerator = pickOption(bestIntent.options);
        const triage = analyzeComplaint(rawMessage, detectedOrderId, bestIntent.id);
        return {
            text: responseGenerator(userName),
            quickReplies: bestIntent.quickReplies || [],
            isEscalated: !!bestIntent.escalate || triage.isComplaint,
            triage
        };
    }

    // 6. Fallback jika tidak ada intent yang tembus threshold
    const fallbackGenerator = pickOption(FALLBACK_OPTIONS);
    const triage = analyzeComplaint(rawMessage, detectedOrderId, null);
    return {
        text: fallbackGenerator(userName),
        quickReplies: ['Cek Nomor Pesanan', 'Panduan Cara Top Up', 'Bicara dengan Staf'],
        isEscalated: triage.isComplaint,
        triage
    };
}

module.exports = {
    processMessage,
    analyzeComplaint,
    normalizeText,
    extractOrderId
};
