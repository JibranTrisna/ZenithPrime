<section class="max-w-4xl mx-auto mt-20 mb-20 bg-gray-800/50 p-8 rounded-lg shadow-lg">
    <h1 class="text-4xl font-bold text-white mb-4"><?php echo htmlspecialchars($data['info_detail']['title']); ?></h1>
    <p class="text-slate-400 text-sm mb-6">Dipublikasikan pada: <?php echo date('d M Y'); ?></p>
    
    <div class="prose prose-invert text-slate-300">
        <p><?php echo nl2br(htmlspecialchars($data['info_detail']['full_content'] ?? $data['info_detail']['description'])); ?></p>
    </div>

    <div class="mt-8">
        <a href="<?php echo BASE_URL; ?>/dashboard" class="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-1">
            <path fill-rule="evenodd" d="M17.75 10a.75.75 0 01-.75.75H7.59l3.966 3.967a.75.75 0 01-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 111.06 1.06L7.59 9.25h9.41a.75.75 0 01.75.75z" clip-rule="evenodd" />
            </svg>
            Kembali ke Beranda
        </a>
    </div>
</section>