</main>
    <footer class="bg-slate-900/50 border-t border-slate-700/50 mt-20 backdrop-blur-lg text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
                
                <div class="flex items-center gap-4">
                    <img src="<?php echo BASE_URL; ?>/assets/images/ZenithPrimeLogo.png" alt="ZenithPrime Logo" class="w-12 h-12 rounded-lg bg-white p-1 shadow-lg">
                    <div>
                        <div class="text-xl font-bold text-cyan-400">ZenithPrime</div>
                        <div class="text-slate-400 text-sm">Top Up Game Terpercaya Indonesia</div>
                    </div>
                </div>
                
                <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-300 text-sm">
                    <a href="<?php echo BASE_URL; ?>/dashboard" class="hover:text-cyan-400 transition-colors">Home</a>
                    <a href="<?php echo BASE_URL; ?>/about" class="hover:text-cyan-400 transition-colors">Tentang Kami</a>
                    <a href="<?php echo BASE_URL; ?>/contact" class="hover:text-cyan-400 transition-colors">Kontak</a>
                    <a href="<?php echo BASE_URL; ?>/privacy" class="hover:text-cyan-400 transition-colors">Kebijakan Privasi</a>
                </div>
                
                <div class="flex flex-col text-center md:text-right text-slate-400 text-sm">
                    <div class="mb-2">Ikuti Kami:</div>
                    <div class="flex gap-4 justify-center md:justify-end">
                        <a href="#" target="_blank" class="hover:text-cyan-400 transition-colors" title="Instagram"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm8.75 2.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5z"></path></svg></a>
                        <a href="#" target="_blank" class="hover:text-cyan-400 transition-colors" title="Facebook"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.525 8.998H14.98V7.315c0-.672.433-.828.737-.828h1.764V3.896L15.06 3.885c-2.76 0-3.393 2.015-3.393 3.314v1.799H9.16v2.886h2.507v7.924h3.313v-7.924h2.227l.318-2.886z"></path></svg></a>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-slate-700/50 pt-8 pb-6 text-slate-400 text-xs text-center">
                Copyright &copy; <?php echo date("Y"); ?> <a href="<?php echo BASE_URL; ?>" class="font-bold text-cyan-400 hover:text-white">ZenithPrime</a> — All Rights Reserved.
            </div>
        </div>
    </footer>
</body>
</html>
<script>
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = setInterval(nextSlide, 5000);

        function nextSlide() {
            slides[currentSlide].classList.remove('opacity-100', 'z-10');
            slides[currentSlide].classList.add('opacity-0', 'z-0', 'absolute');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('opacity-100', 'z-10');
            slides[currentSlide].classList.remove('opacity-0', 'z-0', 'absolute');
        }
    }

    document.querySelectorAll('.interactive-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');

    if (hamburgerButton && mobileMenuOverlay && closeMobileMenuButton) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenuOverlay.classList.add('open');
        });

        closeMobileMenuButton.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('open');
        });

        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove('open');
            }
        });
    }
</script>