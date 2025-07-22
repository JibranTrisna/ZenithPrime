<?php

class Information_model {

    public function getInformations($limit = null) {
        return [
            [
                'title' => 'Cara Aman Jual Beli Skin',
                'description' => 'Ikuti tips dari kami agar transaksi jual beli skin Anda selalu aman, cepat, dan terpercaya!',
                'slug' => 'cara-aman-jual-beli-skin'
            ],
            [
                'title' => 'Info Promo Top Up Game',
                'description' => 'Jangan lewatkan info terbaru mengenai promo dan diskon untuk top up semua game favoritmu.',
                'slug' => 'info-promo-top-up-game'
            ],
            [
                'title' => 'Update Fitur ZenithPrime',
                'description' => 'Fitur baru! Kini Anda dapat jual beli skin berbagai game tanpa ribet hanya di satu platform.',
                'slug' => 'update-fitur-zenithprime'
            ]
        ];
    }

    public function getInformationBySlug($slug) {
        $informations = $this->getInformations();
        foreach ($informations as $info) {
            if ($info['slug'] === $slug) {
                switch ($slug) {
                    case 'cara-aman-jual-beli-skin':
                        $info['full_content'] = "
Selamat datang di panduan keamanan jual beli skin di ZenithPrime! Kami memahami bahwa keamanan adalah prioritas utama Anda. Dengan mengikuti beberapa tips sederhana ini, Anda dapat melakukan transaksi jual beli skin dengan tenang dan nyaman.

**1. Selalu Verifikasi Identitas:**
Pastikan Anda berinteraksi dengan pengguna yang terverifikasi. Di ZenithPrime, kami menyediakan fitur verifikasi yang membantu mengidentifikasi penjual dan pembeli terpercaya. Periksa reputasi dan ulasan pengguna sebelum melakukan transaksi besar.

**2. Gunakan Fitur Rekening Bersama:**
Untuk transaksi jual beli skin yang melibatkan nilai tinggi, manfaatkan fitur rekening bersama atau escrow kami. Dana Anda akan ditahan dengan aman hingga kedua belah pihak mengonfirmasi penyelesaian transaksi, meminimalkan risiko penipuan.

**3. Periksa Detail Item dengan Seksama:**
Sebelum mengonfirmasi pembelian, selalu periksa detail skin secara menyeluruh. Pastikan nama item, kondisi, dan atribut lainnya sesuai dengan deskripsi. Jika ada keraguan, jangan ragu untuk menghubungi penjual atau tim dukungan kami.

**4. Waspadai Tautan dan Penawaran Mencurigakan:**
Penipu seringkali menggunakan tautan palsu atau penawaran yang terlalu bagus untuk menjadi kenyataan. Jangan pernah mengklik tautan yang mencurigakan atau memberikan informasi pribadi Anda di luar platform resmi ZenithPrime.

**5. Laporkan Aktivitas Mencurigakan:**
Jika Anda menemukan aktivitas atau pengguna yang mencurigakan, segera laporkan kepada tim dukungan ZenithPrime. Laporan Anda sangat membantu kami dalam menjaga lingkungan transaksi yang aman bagi semua pengguna.

Dengan mengikuti langkah-langkah ini, pengalaman jual beli skin Anda di ZenithPrime akan selalu aman, cepat, dan terpercaya. Selamat berbelanja dan berjualan!
";
                        break;
                    case 'info-promo-top-up-game':
                        $info['full_content'] = "
Bersiaplah untuk penawaran terbaik! ZenithPrime selalu berkomitmen memberikan nilai lebih bagi para gamers sejati. Kami secara rutin menghadirkan promo dan diskon menarik untuk berbagai top up game favorit Anda.

**Cara Mendapatkan Info Promo Terbaru:**
1.  **Kunjungi Halaman Promosi Kami:** Selalu cek bagian 'Promo' di website ZenithPrime untuk daftar penawaran yang sedang berlangsung.
2.  **Ikuti Media Sosial Kami:** Kami sering mengumumkan promo eksklusif melalui akun media sosial resmi kami (Facebook, Instagram, Twitter). Jangan sampai ketinggalan!
3.  **Berlangganan Newsletter:** Daftarkan email Anda untuk menerima notifikasi langsung tentang diskon, bonus diamond, cashback, dan penawaran waktu terbatas lainnya.

**Jenis Promo yang Sering Tersedia:**
* **Bonus Diamond/VP/UC:** Dapatkan tambahan mata uang in-game setiap kali Anda top up dengan nominal tertentu.
* **Cashback:** Dapatkan sebagian uang Anda kembali dalam bentuk saldo ZenithPrime atau e-wallet tertentu.
* **Diskon Khusus:** Harga spesial untuk top up game tertentu atau item premium.
* **Bundle Hemat:** Kombinasi top up dengan item eksklusif atau aksesori game.
* **Event Spesial:** Promo terkait dengan event in-game atau hari raya tertentu.

Jangan lewatkan kesempatan untuk memaksimalkan pengalaman bermain game Anda dengan harga yang lebih hemat. Top up sekarang di ZenithPrime dan nikmati semua keuntungannya!
";
                        break;
                    case 'update-fitur-zenithprime':
                        $info['full_content'] = "
Kami sangat antusias untuk mengumumkan pembaruan fitur terbaru di ZenithPrime yang akan merevolusi cara Anda top up dan berinteraksi dengan game favorit Anda! Kami selalu mendengarkan masukan dari komunitas dan terus berinovasi untuk memberikan pengalaman terbaik.

**Fitur Terbaru yang Wajib Anda Coba:**

**1. Integrasi Jual Beli Skin Lebih Mudah:**
Kini, Anda tidak hanya bisa top up, tetapi juga dapat dengan mudah jual beli skin dari berbagai game populer. Antarmuka yang intuitif dan sistem keamanan terintegrasi memastikan transaksi Anda berjalan lancar dan aman. Temukan skin impian Anda atau jual koleksi Anda dengan cepat di satu platform.

**2. Notifikasi Transaksi Real-time:**
Tidak perlu lagi menunggu! Dapatkan notifikasi real-time untuk setiap status transaksi Anda, mulai dari pembayaran hingga konfirmasi top up atau pengiriman skin. Anda akan selalu tahu perkembangan pesanan Anda secara instan.

**3. Dukungan Game yang Diperluas:**
Kami terus menambah daftar game yang didukung. Kini, lebih banyak judul game favorit Anda tersedia untuk top up dan layanan jual beli item. Pantau terus pengumuman kami untuk game-game baru yang akan datang!

**4. Peningkatan Performa dan Keamanan:**
Kami telah melakukan optimasi besar-besaran pada infrastruktur backend untuk memastikan kecepatan loading yang lebih baik dan keamanan data yang lebih tinggi. Nikmati pengalaman Browse dan transaksi yang lebih cepat dan aman.

**5. Program Loyalitas Baru:**
Bersiaplah untuk mendapatkan reward lebih! Kami meluncurkan program loyalitas baru yang memberikan poin setiap kali Anda bertransaksi di ZenithPrime. Tukarkan poin Anda dengan diskon eksklusif, bonus top up, atau merchandise menarik.

Kami berkomitmen untuk terus meningkatkan ZenithPrime menjadi platform top up dan jual beli item game terbaik untuk Anda. Rasakan pengalaman baru ini dan berikan feedback Anda kepada kami!
";
                        break;
                    default:
                        $info['full_content'] = "Ini adalah konten lengkap untuk artikel: " . $info['title'] . ". Mohon maaf, konten lengkap belum tersedia.";
                        break;
                }
                return $info;
            }
        }
        return null;
    }
}