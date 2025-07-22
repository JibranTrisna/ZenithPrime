<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold text-cyan-400 mb-6">Riwayat Transaksi Anda</h1>
    
    <?php
    if (isset($_SESSION['success_msg'])) {
        echo '<div class="bg-green-600 text-white p-3 rounded mb-4 text-center">' . htmlspecialchars($_SESSION['success_msg']) . '</div>';
        unset($_SESSION['success_msg']);
    }
    if (isset($_SESSION['error_msg'])) {
        echo '<div class="bg-red-600 text-white p-3 rounded mb-4 text-center">' . htmlspecialchars($_SESSION['error_msg']) . '</div>';
        unset($_SESSION['error_msg']);
    }
    ?>

    <div class="overflow-x-auto">
        <?php if (empty($data['history'])) : ?>
            <p class="text-center text-gray-500 py-8">Anda belum memiliki riwayat transaksi.</p>
        <?php else : ?>
            <table class="min-w-full text-sm text-gray-400">
                <thead class="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left">Order ID</th>
                        <th scope="col" class="px-6 py-3 text-left">Game</th>
                        <th scope="col" class="px-6 py-3 text-left">Item</th> <th scope="col" class="px-6 py-3 text-left">Jumlah</th>
                        <th scope="col" class="px-6 py-3 text-center">Status</th>
                        <th scope="col" class="px-6 py-3 text-center">Tanggal</th>
                        <th scope="col" class="px-6 py-3 text-center">Aksi</th> 
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($data['history'] as $trx) : ?>
                    <tr class="border-b bg-gray-800 border-gray-700">
                        <td class="px-6 py-4 font-medium text-white text-left"><?php echo htmlspecialchars($trx['order_id']); ?></td>
                        <td class="px-6 py-4 text-left"><?php echo htmlspecialchars($trx['game_name']); ?></td>
                        <td class="px-6 py-4 text-left"><?php echo htmlspecialchars($trx['item_name']); ?></td>
                        <td class="px-6 py-4 text-left">Rp <?php echo number_format($trx['amount'], 0, ',', '.'); ?></td>
                        <td class="px-6 py-4 text-center">
                            <span class="px-2 py-1 font-semibold leading-tight rounded-full inline-flex items-center justify-center min-w-[70px]
                                <?php 
                                    $statusClass = '';
                                    $statusText = '';
                                    
                                    $rawStatus = $trx['status'] ?? '';
                                    $normalizedStatus = strtolower(trim($rawStatus));
                                    switch ($normalizedStatus) {
                                        case 'success':
                                            $statusClass = 'bg-green-700 text-green-100';
                                            $statusText = 'Success';
                                            break;
                                        case 'pending':
                                            $statusClass = 'bg-yellow-700 text-yellow-100';
                                            $statusText = 'Pending';
                                            break;
                                        case 'cancelled': 
                                        case 'failed':
                                        case 'deny':
                                        case 'expire':
                                            $statusClass = 'bg-red-700 text-red-100';
                                            $statusText = 'Failed';
                                            break;
                                        default:
                                            $statusClass = 'bg-gray-600 text-gray-100'; 
                                            $statusText = 'Unknown'; 
                                            if (!empty($rawStatus)) {
                                                $statusText = ucfirst(htmlspecialchars($rawStatus));
                                            }
                                            break;
                                    }
                                    echo $statusClass;
                                ?>">
                                <?php echo $statusText; ?>
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center"><?php echo date('d M Y, H:i', strtotime($trx['created_at'])); ?></td>
                        <td class="px-6 py-4 text-center">
                            <?php if ($trx['status'] == 'pending') : ?>
                                <form action="<?php echo BASE_URL; ?>/transaction/resumePayment" method="POST" class="inline-block">
                                    <input type="hidden" name="order_id" value="<?php echo htmlspecialchars($trx['order_id']); ?>">
                                    <button type="submit" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-3 rounded text-xs mr-2">
                                        Bayar
                                    </button>
                                </form>
                                <form action="<?php echo BASE_URL; ?>/transaction/cancelPayment" method="POST" class="inline-block">
                                    <input type="hidden" name="order_id" value="<?php echo htmlspecialchars($trx['order_id']); ?>">
                                    <button type="submit" class="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                                            onclick="return confirm('Apakah Anda yakin ingin membatalkan transaksi ini?');">
                                        Batal
                                    </button>
                                </form>
                            <?php else : ?>
                                <span class="text-gray-500">-</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>