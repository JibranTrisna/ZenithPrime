# 🎮 ZenithPrime

ZenithPrime adalah platform web top-up game modern berbasis **Node.js**, **Express**, **MySQL**, dan payment gateway **Midtrans**. Dilengkapi dengan antarmuka futuristik menggunakan **Tailwind CSS**, sistem live chat interaktif berbasis **Socket.io**, serta panel manajemen untuk staff dan admin.

---

## 🚀 Fitur Utama

- **Top Up Game Cepat & Aman**: Integrasi langsung dengan Payment Gateway Midtrans (Snap & Notification Webhook).
- **Live Chat & Customer Service**: Layanan chat real-time antara pengguna dan staff/admin menggunakan Socket.io.
- **Otomatisasi Cron Job**: Pembersihan riwayat obrolan secara otomatis via `node-cron`.
- **Manajemen Dashboard Admin & Staff**: Manajemen produk/game, promo, review, berita terbaru, dan monitoring transaksi.
- **Autentikasi & Keamanan**: Enkripsi password menggunakan `bcrypt` serta manajemen sesi berbasis `express-session`.
- **Modern UI**: Desain game futuristik dengan Tailwind CSS & dynamic layout EJS.

---

## 🛠️ Tech Stack

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: MySQL / MariaDB (via `mysql2`)
- **Templating**: EJS (`express-ejs-layouts`)
- **Real-Time Communication**: [Socket.io](https://socket.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Payment Gateway**: [Midtrans](https://midtrans.com/)

---

## 📋 Prasyarat

Sebelum menjalankan proyek, pastikan Anda telah menginstal:
1. [Node.js](https://nodejs.org/) (versi LTS direkomendasikan, v18+)
2. [MySQL](https://dev.mysql.com/downloads/) (atau melalui WampServer / XAMPP)

---

## ⚙️ Panduan Instalasi & Menjalankan

### 1. Clone Repository & Masuk ke Direktori
```bash
git clone <repository_url>
cd ZenithPrime
```

### 2. Install Dependensi Node.js
```bash
npm install
```

### 3. Setup Basis Data (MySQL)
1. Buka MySQL Client / phpMyAdmin.
2. Buat database baru bernama `zenithprime_db`.
3. Import file `zenithprime_db.sql` ke dalam database tersebut.

### 4. Konfigurasi Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env` lalu sesuaikan konfigurasi:
```bash
cp .env.example .env
```

Isi konfigurasi dalam berkas `.env`:
```env
PORT=3000
SESSION_SECRET=rahasia_super_aman_zenith

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=zenithprime_db

MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
```

### 5. Jalankan Aplikasi

- **Mode Pengembangan (dengan Nodemon auto-reload):**
  ```bash
  npm run dev
  ```

- **Mode Produksi:**
  ```bash
  npm start
  ```

Aplikasi akan berjalan di `http://localhost:3000`.

---

## 📂 Struktur Direktori

```text
ZenithPrime/
├── app.js                   # Entry point aplikasi Node.js & Socket.io
├── package.json             # Konfigurasi dependensi dan script npm
├── zenithprime_db.sql       # Skema database MySQL
├── .env.example             # Contoh template environment variables
├── .gitignore               # Konfigurasi file yang diabaikan Git
├── public/                  # Asset publik (gambar, video, font, dsb.)
│   ├── css/
│   ├── images/
│   └── js/
└── src/                     # Source code aplikasi
    ├── config/              # Konfigurasi database & Midtrans
    ├── controllers/         # Controller logika bisnis (Auth, Admin, Page, dll.)
    ├── middlewares/         # Middleware otentikasi, upload, dsb.
    ├── models/              # Model query database MySQL
    ├── routes/              # Routing Express
    └── views/               # EJS template views & partials
```

---

## 📄 Lisensi
ISC License © ZenithPrime Team
