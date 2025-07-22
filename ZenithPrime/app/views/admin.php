<h1 class="text-4xl font-bold text-cyan-400 mb-8">Admin Dashboard</h1>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Real-time Login Tracking</h2>
        <div class="overflow-auto max-h-96">
            <table class="min-w-full text-sm text-left text-gray-200"> <thead class="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                    <tr>
                        <th class="px-4 py-2">User</th>
                        <th class="px-4 py-2">IP Address</th>
                        <th class="px-4 py-2">Time</th>
                    </tr>
                </thead>
                <tbody id="login-data-body">
                    <?php if (!empty($data['loginLogs'])): ?>
                        <?php foreach ($data['loginLogs'] as $log): ?>
                            <tr class="border-b bg-gray-800 border-gray-700">
                                <td class="px-4 py-2"><?= htmlspecialchars($log['username'] ?? '') ?> (<?= htmlspecialchars($log['email'] ?? '') ?>)</td>
                                <td class="px-4 py-2"><?= htmlspecialchars($log['ip_address'] ?? '') ?></td>
                                <td class="px-4 py-2"><?= htmlspecialchars(date('d M Y H:i', strtotime($log['created_at'] ?? ''))) ?></td> </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr><td colspan="3" class="text-center p-4 text-gray-400">Tidak ada data login terbaru.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Real-time Transaction Tracking</h2>
        <div class="overflow-auto max-h-96">
            <table class="min-w-full text-sm text-left text-gray-200"> <thead class="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                    <tr>
                        <th class="px-4 py-2">Order ID</th>
                        <th class="px-4 py-2">User</th>
                        <th class="px-4 py-2">Item</th>
                        <th class="px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody id="transaction-data-body">
                    <?php if (!empty($data['recentTransactions'])): ?>
                        <?php foreach ($data['recentTransactions'] as $trx): ?>
                            <tr class="border-b bg-gray-800 border-gray-700">
                                <td class="px-4 py-2 font-medium"><?= htmlspecialchars($trx['order_id'] ?? '') ?></td>
                                <td class="px-4 py-2"><?= htmlspecialchars($trx['username'] ?? '') ?></td> <td class="px-4 py-2"><?= htmlspecialchars($trx['item_name'] ?? '') ?></td>
                                <td class="px-4 py-2">
                                    <?php
                                        $statusClass = '';
                                        switch ($trx['status']) {
                                            case 'success': $statusClass = 'bg-green-700 text-green-100'; break;
                                            case 'pending': $statusClass = 'bg-yellow-700 text-yellow-100'; break;
                                            case 'failed': $statusClass = 'bg-red-700 text-red-100'; break;
                                            case 'expired': $statusClass = 'bg-gray-600 text-gray-100'; break;
                                            default: $statusClass = 'bg-gray-600 text-gray-100'; break;
                                        }
                                    ?>
                                    <span class="px-2 py-1 text-xs font-semibold leading-tight rounded-full <?= $statusClass ?>">
                                        <?= htmlspecialchars(ucfirst($trx['status'] ?? '')) ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr><td colspan="4" class="text-center p-4 text-gray-400">Tidak ada transaksi terbaru.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
    function formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    async function fetchLoginData() {
        try {
            const response = await fetch('<?php echo BASE_URL; ?>/admin/getLoginData');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const tbody = document.getElementById('login-data-body');
            tbody.innerHTML = '';
            if (data.length > 0) {
                data.forEach(log => {
                    tbody.innerHTML += `
                        <tr class="border-b bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                            <td class="px-4 py-2">${log.username || ''} (${log.email || ''})</td>
                            <td class="px-4 py-2">${log.ip_address || ''}</td>
                            <td class="px-4 py-2">${formatTime(log.created_at || '')}</td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center p-4 text-gray-400">Tidak ada data login terbaru.</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching login data:", error);
            document.getElementById('login-data-body').innerHTML = '<tr><td colspan="3" class="text-center p-4 text-red-400">Gagal memuat data login.</td></tr>';
        }
    }

    async function fetchTransactionData() {
        try {
            const response = await fetch('<?php echo BASE_URL; ?>/admin/getTransactionData');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const tbody = document.getElementById('transaction-data-body');
            tbody.innerHTML = '';
            
            const statusClasses = {
                success: 'bg-green-700 text-green-100',
                pending: 'bg-yellow-700 text-yellow-100',
                failed: 'bg-red-700 text-red-100',
                expired: 'bg-gray-600 text-gray-100'
            };

            if (data.length > 0) {
                data.forEach(trx => {
                    const statusClass = statusClasses[trx.status] || 'bg-gray-600 text-gray-100';
                    tbody.innerHTML += `
                        <tr class="border-b bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                            <td class="px-4 py-2 font-medium">${trx.order_id || ''}</td>
                            <td class="px-4 py-2">${trx.username || ''}</td>
                            <td class="px-4 py-2">${trx.item_name || ''}</td>
                            <td class="px-4 py-2">
                                <span class="px-2 py-1 text-xs font-semibold leading-tight rounded-full ${statusClass}">
                                    ${(trx.status || '').charAt(0).toUpperCase() + (trx.status || '').slice(1)}
                                </span>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-gray-400">Tidak ada transaksi terbaru.</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching transaction data:", error);
            document.getElementById('transaction-data-body').innerHTML = '<tr><td colspan="4" class="text-center p-4 text-red-400">Gagal memuat data transaksi.</td></tr>';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        setInterval(fetchLoginData, 5000);
        setInterval(fetchTransactionData, 5000);
    });
</script>