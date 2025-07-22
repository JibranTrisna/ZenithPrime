<?php
if (!isset($_SESSION['user_id'])) {
    header('location: ' . BASE_URL . '/auth/login');
    exit();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title><?php echo $data['title']; ?> - ZenithPrime</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #111827;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at 15% 25%, rgba(0, 122, 255, 0.1), transparent 35%),
                        radial-gradient(circle at 85% 70%, rgba(0, 255, 170, 0.1), transparent 35%);
            z-index: -1;
            animation: subtle-glow 20s infinite alternate;
        }
        @keyframes subtle-glow {
            from { opacity: 0.6; transform: scale(1); }
            to { opacity: 1; transform: scale(1.03); }
        }
        .interactive-card {
            position: relative;
            background-color: rgba(31, 41, 55, 0.5);
            border: 1px solid rgba(55, 65, 81, 1);
            transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .interactive-card:before {
            content: "";
            position: absolute;
            left: 0; top: 0; width: 100%; height: 100%;
            border-radius: inherit;
            background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(0, 255, 255, 0.15), transparent 80%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        .interactive-card:hover:before {
            opacity: 1;
        }
        .interactive-card:hover {
            border-color: rgba(34, 211, 238, 0.4);
            transform: translateY(-5px);
        }

        .interactive-card.selected {
            border-color: #06B6D4;
            background-color: #1a202c;
            box-shadow: 0 0 0 2px #06B6D4;
        }

        .interactive-card input[type="radio"] {
            position: absolute;
            opacity: 0;
            pointer-events: none;
            width: 0;
            height: 0;
        }
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }

        #mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(17, 24, 39, 0.95);
            z-index: 999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        #mobile-menu-overlay.open {
            opacity: 1;
            visibility: visible;
        }

        #mobile-menu-overlay .close-button {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 40px;
            color: white;
            cursor: pointer;
        }

        #mobile-menu-overlay ul {
            list-style: none;
            padding: 0;
            text-align: center;
        }

        #mobile-menu-overlay ul li {
            margin-bottom: 25px;
        }

        #mobile-menu-overlay ul li a {
            font-size: 28px;
            font-weight: 600;
            color: white;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        #mobile-menu-overlay ul li a:hover {
            color: #06B6D4;
        }

        #mobile-user-info {
            position: absolute;
            bottom: 30px;
            font-size: 20px;
            color: #ccc;
            text-align: center;
        }

        #mobile-user-info a {
            color: #dc2626;
            font-weight: bold;
            margin-left: 10px;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        #mobile-user-info a:hover {
            color: #b91c1c;
        }

        .large-bullet-list {
            list-style-type: disc;
            padding-left: 1.5em;
        }
        .large-bullet-list li {
            margin-bottom: 0.5em;
            line-height: 1.5;
        }
        .large-bullet-list li::marker {
            font-size: 1.5em;
            color: #06B6D4;
        }

        .hamburger-icon {
            display: none;
            flex-direction: column;
            justify-content: space-around;
            width: 30px;
            height: 25px;
            cursor: pointer;
            z-index: 1000;
        }

        .hamburger-icon span {
            display: block;
            width: 100%;
            height: 3px;
            background-color: white;
            transition: all 0.3s ease;
            border-radius: 2px;
        }

        @media (max-width: 768px) {
            .hamburger-icon {
                display: flex;
            }
            .navbar-links {
                display: none;
            }
            .user-info-desktop {
                display: none;
            }
        }
    </style>
</head>
<body class="bg-gray-900 text-slate-200 min-h-screen flex flex-col">
    <nav class="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-gray-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <a href="<?php echo BASE_URL; ?>/dashboard" class="text-2xl font-bold text-cyan-400" style="text-shadow: 0 0 10px rgba(34,211,238,0.5);">ZenithPrime</a>

        <ul class="hidden md:flex items-center gap-8 navbar-links">
            <li><a href="<?php echo BASE_URL; ?>/dashboard" class="font-semibold <?php echo ($data['title'] == 'Dashboard') ? 'text-white' : 'text-slate-300'; ?> hover:text-cyan-300 transition-colors">Home</a></li>
            <li><a href="<?php echo BASE_URL; ?>/game" class="font-semibold <?php echo ($data['title'] == 'Pilih Game') ? 'text-white' : 'text-slate-300'; ?> hover:text-cyan-300 transition-colors">Top Up</a></li>
            <li><a href="<?php echo BASE_URL; ?>/transaction/history" class="font-semibold <?php echo ($data['title'] == 'Riwayat Transaksi') ? 'text-white' : 'text-slate-300'; ?> hover:text-cyan-300 transition-colors">Riwayat</a></li>
            <?php if ($_SESSION['user_role'] == 'admin') : ?>
                <li><a href="<?php echo BASE_URL; ?>/admin" class="text-cyan-400 hover:text-white transition-colors">Admin Panel</a></li>
            <?php endif; ?>
        </ul>

        <div class="hidden md:flex items-center gap-4 user-info-desktop">
            <span class="font-semibold text-slate-300"><?php echo htmlspecialchars($_SESSION['user_name']); ?></span>
            <a href="<?php echo BASE_URL; ?>/auth/logout" class="bg-red-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-red-700 transition-colors">Logout</a>
        </div>

        <div class="hamburger-icon md:hidden" id="hamburger-button">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </nav>

    <div id="mobile-menu-overlay" class="fixed inset-0 bg-gray-900/95 z-[999] flex flex-col justify-between items-center opacity-0 invisible transition-opacity duration-300 ease-in-out py-8">
        <button id="close-mobile-menu" class="absolute top-6 right-6 text-white text-5xl font-light hover:text-cyan-400 transition-colors">&times;</button>
        
        <div id="mobile-user-info" class="text-white text-xl font-medium pt-10">
            Halo, <span class="font-bold text-cyan-400"><?php echo htmlspecialchars($_SESSION['user_name']); ?></span>
        </div>

        <ul class="list-none p-0 text-center space-y-8 flex-grow flex flex-col justify-center">
            <li><a href="<?php echo BASE_URL; ?>/dashboard" class="text-white text-3xl font-semibold hover:text-cyan-400 transition-colors block py-2">Home</a></li>
            <li><a href="<?php echo BASE_URL; ?>/game" class="text-white text-3xl font-semibold hover:text-cyan-400 transition-colors block py-2">Top Up</a></li>
            <li><a href="<?php echo BASE_URL; ?>/transaction/history" class="text-white text-3xl font-semibold hover:text-cyan-400 transition-colors block py-2">Riwayat</a></li>
            <?php if ($_SESSION['user_role'] == 'admin') : ?>
                <li><a href="<?php echo BASE_URL; ?>/admin" class="text-cyan-400 text-3xl font-semibold hover:text-white transition-colors block py-2">Admin Panel</a></li>
            <?php endif; ?>
        </ul>

        <a href="<?php echo BASE_URL; ?>/auth/logout" class="mb-10 inline-flex items-center justify-center px-8 py-3 border border-transparent text-xl font-semibold rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
            Logout
        </a>
    </div>

    <main class="px-4 md:px-8 py-8 flex-1">