<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Login - ZenithPrime</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap');
        body {
            font-family: 'Exo 2', sans-serif;
            overflow: hidden;
        }
        #bgVideo {
            position: fixed;
            top: 50%;
            left: 50%;
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            z-index: -2;
            transform: translateX(-50%) translateY(-50%);
            object-fit: cover;
        }
        .video-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(3, 7, 18, 0.7);
            z-index: -1;
        }
        .form-card {
            background: rgba(10, 10, 20, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body class="min-h-screen">
    <video autoplay muted loop id="bgVideo">
        <source src="<?php echo BASE_URL; ?>/assets/videos/bgAuth.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    <div class="video-overlay"></div>

    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-4xl form-card rounded-2xl shadow-2xl flex overflow-hidden">
            <div class="hidden md:flex w-1/2 flex-col items-center justify-center bg-gray-900/40 p-12 border-r border-slate-500/20">
                <img src="<?php echo BASE_URL; ?>/assets/images/ZenithPrimeLogo.png" alt="ZenithPrime Logo" class="w-48 h-48 object-cover rounded-full shadow-lg border-2 border-cyan-400/50">
                <h1 class="text-4xl font-bold text-white mt-6 drop-shadow-lg">ZenithPrime</h1>
                <p class="text-cyan-300">Ascend to Prime.</p>
            </div>

            <div class="w-full md:w-1/2 p-8 md:p-12 text-white">
                <h2 class="text-3xl font-bold mb-2 text-center md:text-left">Sign In</h2>
                <p class="text-gray-400 mb-8 text-center md:text-left">Welcome back, player.</p>
                
                <?php if (isset($data['error'])): ?>
                    <div class="mb-4 text-center font-medium text-red-300 bg-red-800/50 p-3 rounded-lg"><?= htmlspecialchars($data['error']) ?></div>
                <?php endif; ?>
                <?php if (isset($data['success'])): ?>
                    <div class="mb-4 text-center font-medium text-green-300 bg-green-800/50 p-3 rounded-lg"><?= htmlspecialchars($data['success']) ?></div>
                <?php endif; ?>

                <form action="<?php echo BASE_URL; ?>/auth/processLogin" method="post" class="flex flex-col space-y-5">
                    <input type="email" name="email" required
                        class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-gray-500"
                        placeholder="Email Address">
                    <input type="password" name="password" required
                        class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-gray-500"
                        placeholder="Password">
                    <button type="submit"
                            class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold tracking-wider py-3 rounded-md shadow-lg shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105 mt-4">
                        LOGIN
                    </button>
                </form>
                <p class="mt-8 text-center text-gray-400 text-sm">
                    Need an account?
                    <a href="<?php echo BASE_URL; ?>/auth/register" class="text-cyan-400 hover:text-white font-semibold transition">Register Now</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>