<section class="mb-16">
    <h1 class="text-4xl md:text-5xl font-bold text-center text-white mb-4 reveal" style="text-shadow: 0 0 15px rgba(34,211,238,0.3);">Pilih Game Favoritmu</h1>
    <p class="text-slate-400 text-center max-w-2xl mx-auto mb-12 reveal" style="transition-delay: 100ms;">Temukan penawaran terbaik untuk top up dan item di berbagai game populer. Proses cepat, aman, dan terpercaya.</p>
    
    <h2 class="text-3xl font-bold mb-8 text-white reveal" style="transition-delay: 200ms;">🔥 Game Terpopuler</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach($data['popular_games'] as $index => $game): ?>
        <div class="interactive-card rounded-2xl overflow-hidden group reveal flex flex-col" style="transition-delay: <?php echo 300 + ($index * 100); ?>ms;">
            <div class="relative">
                <img src="<?php echo BASE_URL . '/' . htmlspecialchars($game->image_url); ?>" alt="<?php echo htmlspecialchars($game->name); ?>" class="h-48 object-cover w-full group-hover:scale-105 transition-transform duration-300">
                <span class="absolute top-3 right-3 bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full font-semibold border border-cyan-500/30">Populer</span>
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <h3 class="font-bold text-xl mb-2 text-white"><?php echo htmlspecialchars($game->name); ?></h3>
                <p class="text-slate-400 mb-4 text-sm flex-grow">Top up <?php echo htmlspecialchars($game->name); ?> termurah dan terpercaya.</p>
                <a href="<?php echo BASE_URL . '/game/detail/' . $game->id; ?>" class="mt-auto block text-center bg-cyan-600/50 border border-cyan-500 text-cyan-300 font-semibold px-4 py-2 rounded-lg transition hover:bg-cyan-500 hover:text-white w-full">Lihat Detail</a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<section>
    <h2 class="text-3xl font-bold mb-8 text-white reveal">Semua Game (A-Z)</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <?php foreach($data['all_games'] as $index => $game): ?>
        <div class="interactive-card rounded-2xl overflow-hidden group reveal flex flex-col" style="transition-delay: <?php echo 100 + ($index * 30); ?>ms;">
            <img src="<?php echo BASE_URL . '/' . htmlspecialchars($game->image_url); ?>" alt="<?php echo htmlspecialchars($game->name); ?>" class="h-36 object-cover w-full group-hover:scale-105 transition-transform duration-300">
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-semibold text-white truncate mb-2"><?php echo htmlspecialchars($game->name); ?></h3>
                <a href="<?php echo BASE_URL . '/game/detail/' . $game->id; ?>" class="mt-auto block text-center bg-cyan-600/50 border border-cyan-500 text-cyan-300 font-semibold px-4 py-2 rounded-lg transition hover:bg-cyan-500 hover:text-white text-sm w-full">Pilih</a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>