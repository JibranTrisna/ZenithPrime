-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 23 Jul 2025 pada 20.26
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zenithprime_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL COMMENT 'URL atau path ke gambar game',
  `top_up_instructions` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_popular` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `games`
--

INSERT INTO `games` (`id`, `name`, `publisher`, `image_url`, `top_up_instructions`, `is_active`, `is_popular`) VALUES
(1, 'Mobile Legends', 'Moonton', '/assets/images/ML.png', NULL, 1, 1),
(2, 'Free Fire', 'Garena', 'assets/images/FF.png', NULL, 1, 1),
(3, 'Valorant', 'Riot Games', 'assets/images/Valo.png', NULL, 1, 1),
(4, 'Point Blank', 'Zepetto', 'assets/images/PB.png', NULL, 1, 1),
(5, 'Roblox', 'Roblox Corporation', 'assets/images/Roblox.png', NULL, 1, 1),
(6, 'PUBG Mobile', 'Tencent Games', 'assets/images/PUBG.png', NULL, 1, 1),
(7, 'Genshin Impact', 'HoYoverse', 'assets/images/Genshin.png', NULL, 1, 0),
(8, 'Arena of Valor', 'Tencent Games', 'assets/images/AOV.png', NULL, 1, 0),
(9, 'Counter Strike 2', 'Valve', 'assets/images/CS2.png', NULL, 1, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Contoh: 100 Diamonds',
  `price` decimal(10,2) NOT NULL,
  `is_special` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `items`
--

INSERT INTO `items` (`id`, `game_id`, `name`, `price`, `is_special`, `is_active`) VALUES
(1, 1, '86 Diamonds', 19500.00, 0, 1),
(2, 1, '172 Diamonds', 39000.00, 0, 1),
(3, 1, '257 Diamonds', 58500.00, 0, 1),
(4, 1, '344 Diamonds', 78000.00, 0, 1),
(5, 1, '429 Diamonds', 99000.00, 0, 1),
(6, 1, '514 Diamonds', 119000.00, 0, 1),
(7, 1, '706 Diamonds', 157000.00, 0, 1),
(8, 1, '878 Diamonds', 197000.00, 0, 1),
(9, 1, '963 Diamonds', 222000.00, 0, 1),
(10, 1, '1050 Diamonds', 239000.00, 0, 1),
(11, 1, '1220 Diamonds', 279000.00, 0, 1),
(12, 1, '1412 Diamonds', 319000.00, 0, 1),
(13, 1, '1669 Diamonds', 378000.00, 0, 1),
(14, 1, '2195 Diamonds', 473000.00, 0, 1),
(15, 1, '3072 Diamonds', 673000.00, 0, 1),
(16, 1, '3688 Diamonds', 788000.00, 0, 1),
(17, 1, '4032 Diamonds', 868000.00, 0, 1),
(18, 1, '4394 Diamonds', 947000.00, 0, 1),
(19, 1, '5532 Diamonds', 1185000.00, 0, 1),
(20, 1, '6238 Diamonds', 1345000.00, 0, 1),
(21, 1, '7376 Diamonds', 1577000.00, 0, 1),
(22, 1, '9288 Diamonds', 1976000.00, 0, 1),
(23, 1, '12188 Diamonds', 2610000.00, 0, 1),
(24, 1, '18576 Diamonds', 3965000.00, 0, 1),
(25, 1, 'Twilight Pass', 145000.00, 1, 1),
(26, 1, 'WDP', 28500.00, 1, 1),
(27, 1, 'Starlight', 115000.00, 1, 1),
(28, 1, 'Starlight Plus', 240000.00, 1, 1),
(29, 2, '70 Diamonds', 10000.00, 0, 1),
(30, 2, '100 Diamonds', 15000.00, 0, 1),
(31, 2, '140 Diamonds', 19500.00, 0, 1),
(32, 2, '210 Diamonds', 29000.00, 0, 1),
(33, 2, '280 Diamonds', 39500.00, 0, 1),
(34, 2, '355 Diamonds', 48500.00, 0, 1),
(35, 2, '500 Diamonds', 69000.00, 0, 1),
(36, 2, '720 Diamonds', 97000.00, 0, 1),
(37, 2, '1000 Diamonds', 147000.00, 0, 1),
(38, 2, '1450 Diamonds', 196000.00, 0, 1),
(39, 2, '2180 Diamonds', 295000.00, 0, 1),
(40, 2, '3640 Diamonds', 490000.00, 0, 1),
(41, 2, 'Member Mingguan', 30000.00, 1, 1),
(42, 2, 'Member Bulanan', 145000.00, 1, 1),
(43, 3, '125 Points', 14500.00, 0, 1),
(44, 3, '420 Points', 48000.00, 0, 1),
(45, 3, '700 Points', 77000.00, 0, 1),
(46, 3, '1375 Points', 145000.00, 0, 1),
(47, 3, '2400 Points', 245000.00, 0, 1),
(48, 3, '4000 Points', 390000.00, 0, 1),
(49, 3, '8150 Points', 790000.00, 0, 1),
(50, 3, 'Battle Pass', 145000.00, 1, 1),
(51, 4, '1200 PB Cash', 9800.00, 0, 1),
(52, 4, '2400 PB Cash', 19500.00, 0, 1),
(53, 4, '6000 PB Cash', 48500.00, 0, 1),
(54, 4, '12000 PB Cash', 97000.00, 0, 1),
(55, 4, '24000 PB Cash', 195000.00, 0, 1),
(56, 4, '60000 PB Cash', 485000.00, 0, 1),
(57, 4, 'PBWC Basic Pack', 24000.00, 0, 1),
(58, 4, 'PBTN Elite Pack', 48000.00, 0, 1),
(59, 5, '80 Robux', 16000.00, 0, 1),
(60, 5, '400 Robux', 80000.00, 0, 1),
(61, 5, '800 Robux', 155000.00, 0, 1),
(62, 5, '1700 Robux', 310000.00, 0, 1),
(63, 5, '4500 Robux', 790000.00, 0, 1),
(64, 5, '10000 Robux', 1600000.00, 0, 1),
(65, 5, 'Roblox Premium', 80000.00, 1, 1),
(66, 6, '60 UC', 14900.00, 0, 1),
(67, 6, '325 UC', 75000.00, 0, 1),
(68, 6, '660 UC', 149000.00, 0, 1),
(69, 6, '1800 UC', 375000.00, 0, 1),
(70, 6, '3850 UC', 749000.00, 0, 1),
(71, 6, '8100 UC', 1499000.00, 0, 1),
(72, 6, 'Royale Pass Pack', 149000.00, 1, 1),
(73, 7, '60 Genesis Crystals', 15000.00, 0, 1),
(74, 7, '300 + 30 Genesis Crystals', 75000.00, 0, 1),
(75, 7, '980 + 110 Genesis Crystals', 240000.00, 0, 1),
(76, 7, '1980 + 260 Genesis Crystals', 469000.00, 0, 1),
(77, 7, '3280 + 600 Genesis Crystals', 785000.00, 0, 1),
(78, 7, '6480 + 1600 Genesis Crystals', 1550000.00, 0, 1),
(79, 7, 'Blessing of the Welkin Moon', 75000.00, 0, 1),
(80, 8, '40 Voucher', 9800.00, 0, 1),
(81, 8, '90 Voucher', 19500.00, 0, 1),
(82, 8, '230 Voucher', 48500.00, 0, 1),
(83, 8, '470 Voucher', 97000.00, 0, 1),
(84, 8, '950 Voucher', 195000.00, 0, 1),
(85, 8, '1430 Voucher', 292000.00, 0, 1),
(86, 8, '2400 Voucher', 485000.00, 0, 1),
(87, 9, 'Kilowatt Case', 115000.00, 0, 1),
(88, 9, 'Dreams & Nightmares Case', 12500.00, 0, 1),
(89, 9, 'Fracture Case', 8000.00, 0, 1),
(90, 9, 'Revolution Case', 22000.00, 0, 1),
(91, 9, 'AK-47 | Redline (MW)', 235000.00, 0, 1),
(92, 9, 'AWP | Asiimov (FN)', 1475000.00, 0, 1),
(93, 9, 'M4A4 | The Emperor (FN)', 330000.00, 0, 1),
(94, 9, 'Glock-18 | Fade (MW)', 2450000.00, 0, 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_id`, `ip_address`, `login_time`) VALUES
(1, 3, '::1', '2025-07-15 17:15:45'),
(2, 3, '::1', '2025-07-16 02:27:32'),
(3, 3, '::1', '2025-07-16 02:34:36'),
(4, 3, '::1', '2025-07-16 04:52:45'),
(5, 3, '::1', '2025-07-16 07:09:04'),
(6, 3, '::1', '2025-07-16 07:09:51'),
(7, 5, '::1', '2025-07-16 07:11:47'),
(8, 3, '::1', '2025-07-16 07:40:12'),
(9, 5, '::1', '2025-07-16 08:28:22'),
(10, 5, '::1', '2025-07-16 11:38:38'),
(11, 5, '::1', '2025-07-16 12:31:52'),
(12, 6, '::1', '2025-07-16 13:16:03'),
(13, 5, '::1', '2025-07-17 03:17:37'),
(14, 5, '::1', '2025-07-17 05:31:13'),
(15, 5, '::1', '2025-07-17 05:51:30'),
(16, 6, '::1', '2025-07-17 07:09:23'),
(17, 3, '::1', '2025-07-17 07:10:43'),
(18, 6, '::1', '2025-07-18 08:43:11'),
(19, 6, '::1', '2025-07-18 14:54:39'),
(20, 3, '::1', '2025-07-18 14:59:30'),
(21, 6, '::1', '2025-07-18 14:59:55'),
(22, 6, '::1', '2025-07-19 14:51:22'),
(23, 3, '::1', '2025-07-19 14:51:37'),
(24, 5, '::1', '2025-07-19 15:28:34'),
(25, 6, '::1', '2025-07-21 07:13:26'),
(26, 5, '::1', '2025-07-21 07:28:30'),
(27, 6, '::1', '2025-07-21 10:00:08'),
(28, 6, '::1', '2025-07-21 10:15:15'),
(29, 7, '::1', '2025-07-21 12:18:17'),
(30, 7, '::1', '2025-07-21 15:29:25'),
(31, 7, '::1', '2025-07-22 04:58:12'),
(32, 3, '::1', '2025-07-22 04:58:30'),
(33, 5, '::1', '2025-07-22 05:05:56'),
(34, 8, '::1', '2025-07-22 13:34:13'),
(35, 7, '::1', '2025-07-22 14:41:17');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL COMMENT 'ID Unik dari Midtrans',
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL COMMENT 'Total harga',
  `status` enum('pending','success','failed','expired') NOT NULL DEFAULT 'pending',
  `player_id` varchar(100) NOT NULL COMMENT 'ID Pemain di dalam game',
  `payment_token` text DEFAULT NULL COMMENT 'Token dari Midtrans untuk Snap.js',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`id`, `order_id`, `user_id`, `game_id`, `item_name`, `amount`, `status`, `player_id`, `payment_token`, `created_at`, `updated_at`) VALUES
(64, 'ZP-1753205674-7', 7, 2, '2180 Diamonds', 295000.00, 'failed', '1334988623', '5cbb9a99-2cf7-440b-bd73-d674f930881d', '2025-07-22 17:34:34', '2025-07-22 17:37:46'),
(67, 'ZP-1753206309-7', 7, 1, '18576 Diamonds', 3965000.00, 'failed', '1334988623(2889)', '06566549-07dc-444b-b9ee-1ed277d4c559', '2025-07-22 17:45:10', '2025-07-22 17:48:44'),
(68, 'ZP-1753206534-7', 7, 3, '8150 Points', 790000.00, 'failed', '3225467680', '70cc841e-4947-4c52-8de5-08d7f192be46', '2025-07-22 17:48:54', '2025-07-22 17:50:41'),
(69, 'ZP-1753206659-7', 7, 8, '2400 Voucher', 485000.00, 'success', '1334988623', '9a3ebf11-9615-4b3f-8276-85ede759e69d', '2025-07-22 17:51:00', '2025-07-22 17:51:57'),
(70, 'ZP-1753206766-7', 7, 5, '10000 Robux', 1600000.00, 'success', '3225467680', '183ea2e5-e35b-46ce-8537-bb3b677e7db3', '2025-07-22 17:52:47', '2025-07-22 17:53:10'),
(71, 'ZP-1753206925-7', 7, 4, '2400 PB Cash', 19500.00, 'success', '1334988623', '317c921e-0f93-4276-a591-0a48cd1ebd8a', '2025-07-22 17:55:25', '2025-07-22 17:55:52'),
(72, 'ZP-1753207007-7', 7, 1, '9288 Diamonds', 1976000.00, 'success', '1334988623(2889)', '7d606d92-57aa-4c20-9b48-dcdb74048d7a', '2025-07-22 17:56:48', '2025-07-22 18:20:15');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Gunakan password_hash() PHP',
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Jibran', 'Jibran@gmail.com', '$2y$10$aB1cD2eF3gH4iJ5kL6mN7o.P8qR9sT0uV1wX2yZ3aB4cDeF5gH6iJ', 'user', '2025-07-15 16:23:30'),
(3, 'JibranTrisna', 'JibranTrisna@gmail.com', '$2y$10$tfsNR7.eAzJK3/U7gt4qyeadP3gCQtnNThyesFYskpYBvfx0mxNuC', 'admin', '2025-07-15 17:15:37'),
(5, 'VerlianaHumairah', 'Verliana01@gmail.com', '$2y$10$Ke/GYZzAZf72AvD6/ZLiuOFbOk48aD2wdx8E/L/TsmiqckbbznB6i', 'user', '2025-07-16 07:11:40'),
(6, 'Jibran', 'jibran20@gmail.com', '$2y$10$evJRew2Hz.ABrDoox/eD0ux9EQo7XB551ZbqqWdYmvExWqRNclKAq', 'user', '2025-07-16 13:15:54'),
(7, 'Jibran', 'jibraniban288@gmail.com', '$2y$10$od94Ir6W7e93JMrFF6RgouMhf9Ley3gPUjYWGoXc92hUr0O3X72ym', 'user', '2025-07-21 12:18:12'),
(8, 'Zhafira', 'Zhafira009@gmail.com', '$2y$10$Ig6d6p/q8OBnMSt2HGXH0OtJ2mo1FzJJet8fdOK74YukMN3aLOGQ.', 'user', '2025-07-22 13:30:04');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indeks untuk tabel `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT untuk tabel `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
