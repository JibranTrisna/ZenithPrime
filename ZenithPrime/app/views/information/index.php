<section class="max-w-6xl mx-auto mt-20 mb-20">
    <h2 class="text-3xl font-bold mb-4 text-center text-white reveal">Wawasan & Berita Terbaru</h2>
    <p class="text-slate-400 text-center max-w-2xl mx-auto mb-10 reveal" style="transition-delay: 100ms;">Dapatkan informasi, tips, dan update fitur terbaru langsung dari tim ZenithPrime.</p>
    <div class="grid md:grid-cols-3 gap-6">
        <?php $delay = 0; ?>
        <?php foreach ($data['informations'] as $info): 
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
    </div>
</section>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
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