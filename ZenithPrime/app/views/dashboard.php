<section class="relative bg-black rounded-2xl p-8 md:p-10 mb-12 text-white overflow-hidden shadow-lg shadow-purple-500/20 reveal">
    
    <video autoplay loop muted playsinline 
           class="absolute inset-0 w-full h-full object-cover z-0">
        <source src="<?php echo BASE_URL; ?>/assets/videos/ZenithPrimeBanner.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"></div> 
    
    <div class="relative z-20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="md:w-3/4">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">Selamat Datang, 
                <?php 
                if (isset($_SESSION['user_name']) && !empty($_SESSION['user_name'])) {
                    echo htmlspecialchars($_SESSION['user_name']); 
                } else {
                    echo "Player!";
                }
                ?>
            </h2>
            <p class="max-w-xl mb-6 md:mb-0">
                Nikmati diskon spesial untuk top up pertamamu! Gunakan kode: 
                <span class="font-bold bg-white/20 px-2 py-1 rounded-md tracking-widest">ZENITHNEW</span>
            </p>
        </div>
        <div class="w-full md:w-auto">
            <a href="<?php echo BASE_URL; ?>/game" class="block w-full text-center bg-white text-gray-900 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
                Klaim Promo
            </a>
        </div>
    </div>
</section>

<div class="relative w-full max-w-7xl mx-auto h-[28rem] rounded-3xl overflow-hidden shadow-2xl shadow-cyan-900/20 mb-20">
    <?php
    foreach ($data['slider'] as $i => $slide) {
        $show = $i === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute';
        $media_element = '<video class="object-cover w-full h-full" poster="'.htmlspecialchars($slide["poster"]).'" autoplay muted loop playsinline>
                              <source src="'.BASE_URL.'/'.htmlspecialchars($slide["video"]).'" type="video/mp4">
                          </video>';

        echo '<div class="carousel-slide inset-0 h-full w-full transition-opacity duration-1000 '.$show.'" id="slide-'.$i.'">
                  '.$media_element.'
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div class="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                      <h1 class="text-4xl md:text-6xl font-bold mb-3" style="text-shadow: 2px 2px 10px rgba(0,0,0,0.7);">'.htmlspecialchars($slide["title"]).'</h1>
                      <p class="mb-6 max-w-lg text-slate-200" style="text-shadow: 1px 1px 5px rgba(0,0,0,0.7);">'.htmlspecialchars($slide["desc"]).'</p>
                      <a href="'.BASE_URL.'/game" class="bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20">Telusuri Sekarang</a>
                  </div>
              </div>';
    }
    ?>
</div>

<section class="max-w-7xl mx-auto mb-20">
    <h2 class="text-3xl font-bold mb-4 text-center text-white reveal">Kenapa ZenithPrime?</h2>
    <p class="text-slate-400 text-center max-w-2xl mx-auto mb-10 reveal">Platform terpercaya untuk semua kebutuhan gaming Anda, dari transaksi kilat hingga promo menarik.</p>
    <div class="grid md:grid-cols-3 gap-6">
        <div class="interactive-card rounded-2xl p-6 text-center reveal">
            <div class="flex justify-center mb-4 text-cyan-400"><svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg></div>
            <h3 class="text-xl font-semibold mb-2 text-white">Transaksi Kilat</h3>
            <p class="text-slate-400 text-sm">Top up atau beli item langsung masuk ke akun Anda dalam hitungan detik.</p>
        </div>
        <div class="interactive-card rounded-2xl p-6 text-center reveal">
            <div class="flex justify-center mb-4 text-cyan-400"><svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" /></svg></div>
            <h3 class="text-xl font-semibold mb-2 text-white">100% Aman</h3>
            <p class="text-slate-400 text-sm">Semua transaksi dijamin aman, legal, dan terpercaya.</p>
        </div>
        <div class="interactive-card rounded-2xl p-6 text-center reveal">
            <div class="flex justify-center mb-4 text-cyan-400"><svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-1.44m0 0c-3.037.038-5.963 1.146-8.17 3.07M15.362 5.214a9.04 9.04 0 012.924 2.115M15.362 5.214L12 12m3.362-6.786l-3.362 6.786m0 0l-3.362-6.786m3.362 6.786l3.362 6.786" /></svg></div>
            <h3 class="text-xl font-semibold mb-2 text-white">Promo Terbaik</h3>
            <p class="text-slate-400 text-sm">Nikmati promo spesial dan diskon menarik untuk semua game favorit Anda.</p>
        </div>
    </div>
</section>

<section class="max-w-6xl mx-auto mt-20 mb-20">
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-white reveal">Diskon & Promo Spesial</h2>
        <a href="<?php echo BASE_URL; ?>/game" class="group flex items-center text-sm font-semibold 
            <?php echo ($data['title'] == 'Pilih Game') ? 'text-white' : 'text-slate-300'; ?> 
            hover:text-cyan-300 transition-colors mt-3"> <span>Lihat Semua</span>
            <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </a>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <?php $promoDelay = 0; ?>
        <?php if (!empty($data['special_promos'])): ?>
            <?php foreach ($data['special_promos'] as $promo): 
                $promoDelay += 100;
                $promo_link_url = BASE_URL . '/game/detail/' . htmlspecialchars($promo['game_id']) . '?item_id=' . htmlspecialchars($promo['item_id']);
            ?>
            <div class="interactive-card rounded-xl overflow-hidden group reveal clickable-card-promo" style="transition-delay: <?= $promoDelay ?>ms;"
                 data-promo-link="<?= $promo_link_url ?>">
                <img src="<?php echo BASE_URL . '/' . htmlspecialchars($promo['image_url']); ?>" class="h-32 object-cover w-full group-hover:scale-105 transition-transform duration-300">
                <div class="p-4">
                    <h4 class="font-semibold text-white truncate"><?php echo htmlspecialchars($promo['item_name']); ?></h4>
                    <p class="text-sm text-red-400 line-through">Rp <?php echo number_format($promo['original_price'], 0, ',', '.'); ?></p>
                    <p class="text-xl font-bold text-cyan-400 mb-3">Rp <?php echo number_format($promo['promo_price'], 0, ',', '.'); ?></p>
                    <a href="<?= $promo_link_url ?>" class="promo-buy-button block text-center bg-cyan-600/50 border border-cyan-500 text-cyan-300 font-semibold px-4 py-2 rounded-lg transition hover:bg-cyan-500 hover:text-white text-sm w-full">Beli</a>
                </div>
            </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="col-span-4 text-center text-slate-400">Belum ada diskon atau promo spesial.</p>
        <?php endif; ?>
    </div>
</section>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const clickablePromoCards = document.querySelectorAll('.clickable-card-promo');

        clickablePromoCards.forEach(card => {
            card.addEventListener('click', function(event) {
                const promoLinkUrl = this.dataset.promoLink;
                if (promoLinkUrl && !event.target.closest('.promo-buy-button')) {
                    window.location.href = promoLinkUrl;
                }
            });
            card.style.cursor = 'pointer'; 
        });
    });
</script>

<section class="max-w-6xl mx-auto mt-20 mb-20">
    <h2 class="text-3xl font-bold mb-4 text-center text-white reveal">Wawasan & Berita Terbaru</h2>
    <p class="text-slate-400 text-center max-w-2xl mx-auto mb-10 reveal" style="transition-delay: 100ms;">Dapatkan informasi, tips, dan update fitur terbaru langsung dari tim ZenithPrime.</p>
    <div class="grid md:grid-cols-3 gap-6">
        <?php $delay = 0; ?>
        <?php if (!empty($data['recent_informations'])): ?>
            <?php foreach ($data['recent_informations'] as $info): 
                $delay += 100;
            ?>
            <div class="interactive-card flex flex-col rounded-2xl p-6 reveal clickable-card" style="transition-delay: <?= $delay ?>ms;">
                <h3 class="text-lg font-semibold text-white mb-2"><?php echo htmlspecialchars($info['title']); ?></h3>
                <p class="text-slate-400 text-sm mb-4 flex-grow"><?php echo htmlspecialchars($info['description']); ?></p>
                <a href="<?php echo BASE_URL; ?>/information/detail/<?php echo htmlspecialchars($info['slug']); ?>" class="card-link group text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
                    <span>Baca Selengkapnya</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1">
                    <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
                    </svg>
                </a>
            </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="col-span-3 text-center text-slate-400">Belum ada informasi atau berita terbaru.</p>
        <?php endif; ?>
    </div>
</section>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(reveal => {
            observer.observe(reveal);
        });

        const clickableCards = document.querySelectorAll('.clickable-card');

        clickableCards.forEach(card => {
            card.addEventListener('click', function(event) {
                const link = this.querySelector('.card-link');
                
                if (link && !link.contains(event.target)) {
                    window.location.href = link.href;
                }
            });

            card.style.cursor = 'pointer'; 
        });
    });
</script>