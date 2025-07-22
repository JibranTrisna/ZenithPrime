<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
    <div class="md:col-span-1">
        <img src="<?php echo BASE_URL . '/' . htmlspecialchars($data['game']->image_url); ?>" alt="<?php echo htmlspecialchars($data['game']->name); ?>" class="rounded-lg shadow-lg w-full mb-4">
        <h1 class="text-3xl font-bold"><?php echo htmlspecialchars($data['game']->name); ?></h1>
        <p class="text-gray-400 mb-4"><?php echo htmlspecialchars($data['game']->publisher); ?></p>
        <div class="text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg">
            <p class="font-bold mb-2">Cara Top Up:</p>
            <ol class="list-decimal list-inside space-y-1">
                <li>Masukkan ID Pengguna Game Anda.</li>
                <li>Pilih nominal item yang diinginkan.</li>
                <li>Klik "Beli Sekarang" & konfirmasi pesanan.</li>
                <li>Selesaikan pembayaran.</li>
            </ol>
        </div>
    </div>

    <div class="md:col-span-2">
        <form id="payment-form" action="<?php echo BASE_URL; ?>/transaction/processPayment" method="POST">
            <input type="hidden" name="game_id" value="<?php echo $data['game']->id; ?>">
            
            <div class="bg-gray-800/50 p-6 rounded-2xl shadow-lg mb-6">
                <h2 class="text-xl font-bold text-cyan-400 border-b border-gray-700 pb-3 mb-4">1. Masukkan Data Akun</h2>
                <div>
                    <label for="player_id" class="block mb-2 text-sm font-medium text-gray-300">User ID</label>
                    <input type="text" name="player_id" id="player_id" class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" placeholder="Masukkan User ID Anda" required>
                </div>
            </div>

            <div class="bg-gray-800/50 p-6 rounded-2xl shadow-lg">
                <h2 class="text-xl font-bold text-cyan-400 border-b border-gray-700 pb-3 mb-6">2. Pilih Nominal</h2>
                <?php if (!empty($data['regular_items'])) : ?>
                    <h3 class="text-lg font-semibold text-cyan-300 mb-4">Top Up Reguler</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                         <?php foreach ($data['regular_items'] as $item) : ?>
                            <label class="interactive-card flex flex-col justify-center text-center p-4 rounded-xl cursor-pointer bg-slate-800 border-slate-700">
                                <input type="radio" name="item" value='<?php echo json_encode(["name" => $item->name, "price" => $item->price]); ?>' class="absolute opacity-0" required>
                                <span class="font-bold text-lg text-white"><?php echo htmlspecialchars($item->name); ?></span>
                                <span class="text-sm text-cyan-300 font-semibold mt-1">Rp <?php echo number_format($item->price, 0, ',', '.'); ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if (!empty($data['special_items'])) : ?>
                    <h3 class="text-lg font-semibold text-fuchsia-400 mb-4 mt-8">Paket Spesial</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                        <?php foreach ($data['special_items'] as $item) : ?>
                            <label class="interactive-card flex flex-col justify-center text-center p-4 rounded-xl cursor-pointer bg-slate-800 border-slate-700">
                                <input type="radio" name="item" value='<?php echo json_encode(["name" => $item->name, "price" => $item->price]); ?>' class="absolute opacity-0" required>
                                <span class="font-bold text-lg text-white"><?php echo htmlspecialchars($item->name); ?></span>
                                <span class="text-sm text-fuchsia-300 font-semibold mt-1">Rp <?php echo number_format($item->price, 0, ',', '.'); ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <div class="mt-8">
                <button type="button" id="show-confirmation-button" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-transform transform hover:scale-105 text-lg">
                    Beli Sekarang
                </button>
            </div>
        </form>
    </div>
</div>

<div id="confirmation-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-gray-800 w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 class="text-2xl font-bold text-cyan-400 mb-4">Konfirmasi Pesanan Anda</h2>
        <p class="text-gray-300 mb-6">Harap periksa kembali detail pesanan Anda sebelum melanjutkan pembayaran.</p>
        
        <div class="space-y-3 text-sm border-t border-b border-gray-700 py-4">
            <div class="flex justify-between">
                <span class="text-gray-400">Game:</span>
                <span class="font-semibold"><?php echo htmlspecialchars($data['game']->name); ?></span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">User ID:</span>
                <span id="confirm-player-id" class="font-semibold"></span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">Item:</span>
                <span id="confirm-item-name" class="font-semibold"></span>
            </div>
             <div class="flex justify-between text-lg">
                <span class="text-gray-400">Total Harga:</span>
                <span id="confirm-item-price" class="font-bold text-cyan-300"></span>
            </div>
        </div>

        <div class="mt-6 flex justify-end gap-4">
            <button type="button" id="cancel-button" class="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold">Batal</button>
            <button type="button" id="confirm-button" class="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-bold">Lanjutkan & Bayar</button>
        </div>
    </div>
</div>
<script>
    const form = document.getElementById('payment-form');
    const showConfirmationButton = document.getElementById('show-confirmation-button');
    const modal = document.getElementById('confirmation-modal');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('cancel-button');
    const itemRadios = document.querySelectorAll('input[name="item"]'); 
    const itemLabels = document.querySelectorAll('.interactive-card'); 

    function manageCardSelection(selectedRadio) {
        itemLabels.forEach(label => {
            label.classList.remove('selected');
        });

        if (selectedRadio) {
            selectedRadio.closest('.interactive-card').classList.add('selected');
        }
    }

    itemRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            manageCardSelection(this); 
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        const preSelectedRadio = document.querySelector('input[name="item"]:checked');
        if (preSelectedRadio) {
            manageCardSelection(preSelectedRadio);
        }
    });

    showConfirmationButton.addEventListener('click', function() {
        const playerId = document.getElementById('player_id').value;
        const selectedItemRadio = document.querySelector('input[name="item"]:checked');

        if (!playerId) {
            alert('Harap masukkan User ID Anda.');
            return;
        }

        if (!selectedItemRadio) {
            alert('Harap pilih salah satu item nominal.');
            return;
        }

        const itemData = JSON.parse(selectedItemRadio.value);
        const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(itemData.price);

        document.getElementById('confirm-player-id').textContent = playerId;
        document.getElementById('confirm-item-name').textContent = itemData.name;
        document.getElementById('confirm-item-price').textContent = priceFormatted;

        modal.classList.remove('hidden');
    });

    confirmButton.addEventListener('click', function() {
        form.submit();
    });

    cancelButton.addEventListener('click', function() {
        modal.classList.add('hidden');
    });
</script>